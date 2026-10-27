/**
 * NATIVE LOCAL NOTIFICATIONS & ALARM CONTROLLER - Deadline Buddy
 * 
 * Powered by Capacitor Local Notifications & Android Alarm Scheduling.
 * 
 * Key Characteristics:
 * - Schedules alarms directly into the mobile operating system (Android AlarmManager).
 * - Does NOT require the app to stay open or run continuous background JavaScript loops.
 * - Fires even when:
 *   ✓ App is completely closed
 *   ✓ App is swiped away from recent apps
 *   ✓ Device screen is locked / phone is asleep
 *   ✓ Wi-Fi and mobile data are completely turned OFF (100% offline)
 * - Automatically reschedules alarms on app launch and device reboot.
 * - Gracefully falls back to browser notifications when running as a PWA in a desktop/mobile web browser.
 */

const LocalNotificationService = (function() {
    // Check if running inside Capacitor native container with LocalNotifications plugin
    function isCapacitorNative() {
        return typeof window.Capacitor !== 'undefined' && 
               window.Capacitor.isNativePlatform && 
               window.Capacitor.isNativePlatform() &&
               typeof window.Capacitor.Plugins !== 'undefined' &&
               typeof window.Capacitor.Plugins.LocalNotifications !== 'undefined';
    }

    function getPlugin() {
        if (isCapacitorNative()) {
            return window.Capacitor.Plugins.LocalNotifications;
        }
        return null;
    }

    /**
     * Check current notification permission status.
     * Returns: 'granted' | 'denied' | 'prompt' | 'unsupported'
     */
    async function checkPermissionStatus() {
        const plugin = getPlugin();
        if (plugin) {
            try {
                const status = await plugin.checkPermissions();
                return status.display; // 'granted', 'denied', or 'prompt'
            } catch (err) {
                console.warn('[LocalNotifications] checkPermissions error:', err);
            }
        }
        if ('Notification' in window) {
            return Notification.permission;
        }
        return 'unsupported';
    }

    /**
     * Request notification permission from user with native dialog.
     */
    async function requestPermissions() {
        const plugin = getPlugin();
        if (plugin) {
            try {
                const status = await plugin.requestPermissions();
                return status.display === 'granted';
            } catch (err) {
                console.error('[LocalNotifications] Permission request error:', err);
                return false;
            }
        }
        if ('Notification' in window) {
            const res = await Notification.requestPermission();
            return res === 'granted';
        }
        return false;
    }

    /**
     * Generate 4 predictable notification IDs for a given task ID:
     * - taskId * 10 + 1: 1 Day Before
     * - taskId * 10 + 2: 1 Hour Before
     * - taskId * 10 + 3: 20 Minutes Before
     * - taskId * 10 + 4: Overdue Alert
     */
    function getNotificationIds(taskId) {
        // Ensure numeric ID within 32-bit integer limits for Android PendingIntent
        const base = Math.abs(parseInt(taskId, 10)) % 200000;
        return {
            oneDay: base * 10 + 1,
            oneHour: base * 10 + 2,
            twentyMin: base * 10 + 3,
            overdue: base * 10 + 4
        };
    }

    /**
     * Calculate absolute reminder timestamps for a task.
     */
    function calculateReminderTimes(dueDateStr, dueTimeStr) {
        if (!dueDateStr) return null;
        const timeStr = dueTimeStr || '23:59';
        const deadlineDate = new Date(`${dueDateStr}T${timeStr}:00`);
        if (isNaN(deadlineDate.getTime())) return null;

        const deadlineMs = deadlineDate.getTime();
        return {
            deadline: deadlineDate,
            oneDay: new Date(deadlineMs - 24 * 60 * 60 * 1000),      // 24 hours before
            oneHour: new Date(deadlineMs - 60 * 60 * 1000),          // 1 hour before
            twentyMin: new Date(deadlineMs - 20 * 60 * 1000),        // 20 minutes before
            overdue: new Date(deadlineMs + 60 * 1000)                // 1 minute after deadline
        };
    }

    /**
     * Schedule native local notifications for a requirement.
     * Automatically registers alarms with Android AlarmManager via Capacitor.
     */
    async function scheduleTaskReminders(task) {
        if (!task || task.status === 'Completed') {
            await cancelTaskReminders(task ? task.id : null);
            return [];
        }

        const times = calculateReminderTimes(task.dueDate, task.dueTime);
        if (!times) return [];

        const now = Date.now();
        const ids = getNotificationIds(task.id);
        const taskTitle = task.title || 'Academic Requirement';
        const notificationsToSchedule = [];

        // Check user preferences if saved
        const prefs = JSON.parse(localStorage.getItem('deadlinebuddy_notif_prefs') || '{}');
        const allow1Day = prefs.day1 !== false;
        const allow1Hour = prefs.hour1 !== false;
        const allow20Min = prefs.min20 !== false;
        const allowOverdue = prefs.overdue !== false;

        // 1. 1 Day Before
        if (allow1Day && times.oneDay.getTime() > now) {
            notificationsToSchedule.push({
                id: ids.oneDay,
                title: 'Deadline Tomorrow: ' + taskTitle,
                body: `${taskTitle} is due tomorrow at ${task.dueTime || '11:59 PM'}. Prepare your submission!`,
                schedule: { at: times.oneDay, allowWhileIdle: true },
                sound: 'beep.wav',
                extra: { taskId: task.id, type: '1day' }
            });
        }

        // 2. 1 Hour Before
        if (allow1Hour && times.oneHour.getTime() > now) {
            notificationsToSchedule.push({
                id: ids.oneHour,
                title: 'Due in 1 Hour: ' + taskTitle,
                body: `Final review! ${taskTitle} is due in 1 hour. Make sure your files are ready.`,
                schedule: { at: times.oneHour, allowWhileIdle: true },
                sound: 'beep.wav',
                extra: { taskId: task.id, type: '1hour' }
            });
        }

        // 3. 20 Minutes Before
        if (allow20Min && times.twentyMin.getTime() > now) {
            notificationsToSchedule.push({
                id: ids.twentyMin,
                title: 'Urgent: Due in 20 Minutes',
                body: `${taskTitle} must be submitted in 20 minutes! Submit now to avoid being late.`,
                schedule: { at: times.twentyMin, allowWhileIdle: true },
                sound: 'beep.wav',
                extra: { taskId: task.id, type: '20min' }
            });
        }

        // 4. Overdue Alert
        if (allowOverdue && times.overdue.getTime() > now) {
            notificationsToSchedule.push({
                id: ids.overdue,
                title: 'Deadline Missed: ' + taskTitle,
                body: `The deadline for ${taskTitle} has passed. Submit immediately if late submissions are accepted.`,
                schedule: { at: times.overdue, allowWhileIdle: true },
                sound: 'beep.wav',
                extra: { taskId: task.id, type: 'overdue' }
            });
        }

        // Cancel previous alarms for this task first to prevent duplicates
        await cancelTaskReminders(task.id);

        const plugin = getPlugin();
        if (plugin && notificationsToSchedule.length > 0) {
            try {
                await plugin.schedule({ notifications: notificationsToSchedule });
                console.info(`[LocalNotifications] Successfully scheduled ${notificationsToSchedule.length} native alarms for task ${task.id}`);
            } catch (err) {
                console.error('[LocalNotifications] Error scheduling native alarms:', err);
            }
        }

        // Keep local registry of scheduled reminder IDs in LocalStorage
        saveScheduledRecord(task.id, notificationsToSchedule);
        return notificationsToSchedule;
    }

    /**
     * Cancel all scheduled alarms for a task.
     */
    async function cancelTaskReminders(taskId) {
        if (!taskId) return;
        const ids = getNotificationIds(taskId);
        const plugin = getPlugin();

        if (plugin) {
            try {
                await plugin.cancel({
                    notifications: [
                        { id: ids.oneDay },
                        { id: ids.oneHour },
                        { id: ids.twentyMin },
                        { id: ids.overdue }
                    ]
                });
                console.info(`[LocalNotifications] Cancelled alarms for task ${taskId}`);
            } catch (err) {
                console.warn('[LocalNotifications] Cancel error:', err);
            }
        }

        removeScheduledRecord(taskId);
    }

    /**
     * Reschedule all active uncompleted tasks.
     * Called on app boot, storage sync, or device restart.
     */
    async function rescheduleAllActiveTasks(tasks) {
        if (!Array.isArray(tasks)) return;
        const pending = tasks.filter(t => t.status !== 'Completed');
        console.info(`[LocalNotifications] Rescheduling alarms for ${pending.length} active requirements...`);
        for (const task of pending) {
            await scheduleTaskReminders(task);
        }
    }

    /**
     * Send an immediate test notification via Capacitor or Web Notification API.
     */
    async function sendTestNotification() {
        const plugin = getPlugin();
        const testId = 99999;

        if (plugin) {
            const hasPerm = await requestPermissions();
            if (!hasPerm) {
                throw new Error('Notification permission is not granted on this device.');
            }
            await plugin.schedule({
                notifications: [
                    {
                        id: testId,
                        title: 'Deadline Buddy Test Alert',
                        body: 'Native local alarms and notifications are functioning properly on your device!',
                        schedule: { at: new Date(Date.now() + 1000) },
                        sound: 'beep.wav',
                        extra: { type: 'test' }
                    }
                ]
            });
            return { native: true, message: 'Native device test notification scheduled for 1 second from now!' };
        }

        // Web PWA fallback
        if ('Notification' in window) {
            if (Notification.permission !== 'granted') {
                const p = await Notification.requestPermission();
                if (p !== 'granted') throw new Error('Notification permission denied.');
            }
            if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
                const reg = await navigator.serviceWorker.ready;
                reg.showNotification('Deadline Buddy Test Alert', {
                    body: 'Notification system is working properly on this browser.',
                    icon: './images/icon-192.png',
                    badge: './images/icon-192.png'
                });
            } else {
                new Notification('Deadline Buddy Test Alert', {
                    body: 'Notification system is working properly on this browser.',
                    icon: './images/icon-192.png'
                });
            }
            return { native: false, message: 'Browser test notification displayed!' };
        }

        throw new Error('Notifications are not supported on this device/browser.');
    }

    /**
     * Query pending scheduled alarms from Capacitor.
     */
    async function getPendingNotifications() {
        const plugin = getPlugin();
        if (plugin) {
            try {
                const res = await plugin.getPending();
                return res.notifications || [];
            } catch (_) {
                return [];
            }
        }
        return getScheduledRecords();
    }

    // Helper functions for tracking scheduled alarms locally
    function getScheduledRecords() {
        return JSON.parse(localStorage.getItem('deadlinebuddy_local_alarms') || '{}');
    }

    function saveScheduledRecord(taskId, notifs) {
        const records = getScheduledRecords();
        records[taskId] = notifs.map(n => ({ id: n.id, at: n.schedule.at, title: n.title }));
        localStorage.setItem('deadlinebuddy_local_alarms', JSON.stringify(records));
    }

    function removeScheduledRecord(taskId) {
        const records = getScheduledRecords();
        delete records[taskId];
        localStorage.setItem('deadlinebuddy_local_alarms', JSON.stringify(records));
    }

    // Initialize notification action listener when running in native Capacitor
    function initListeners() {
        const plugin = getPlugin();
        if (plugin) {
            plugin.addListener('localNotificationActionPerformed', (notificationAction) => {
                const extra = notificationAction.notification.extra || {};
                if (extra.taskId) {
                    window.location.href = `task-details.html?id=${extra.taskId}`;
                } else {
                    window.location.href = 'reminders.html';
                }
            });
        }
    }

    // Bootstrapping
    if (typeof window !== 'undefined') {
        window.addEventListener('DOMContentLoaded', () => {
            initListeners();
            // Reschedule whenever the app is opened
            if (typeof Storage !== 'undefined' && typeof Storage.getTasks === 'function') {
                rescheduleAllActiveTasks(Storage.getTasks());
            }
        });
    }

    return {
        isCapacitorNative,
        checkPermissionStatus,
        requestPermissions,
        scheduleTaskReminders,
        cancelTaskReminders,
        rescheduleAllActiveTasks,
        sendTestNotification,
        getPendingNotifications,
        calculateReminderTimes
    };
})();

// Attach globally
window.LocalNotificationService = LocalNotificationService;
window.DeadlineAlarms = LocalNotificationService;
