/**
 * DEVICE REMINDER BRIDGE - Deadline Buddy
 * Browser version: keeps the UI reminders working while the page is open.
 * Electron version: syncs saved requirements to the Windows background process
 * so native notifications can fire while the main window is hidden in the tray.
 */

const DEVICE_REMINDER_KEYS = {
    PREFS: 'deadlinebuddy_device_reminder_preferences'
};

const DEFAULT_DEVICE_REMINDER_PREFS = {
    oneDay: true,
    oneHour: true,
    twentyMinutes: true,
    overdue: true
};

const DeviceReminders = {
    getPreferences() {
        try {
            return {
                ...DEFAULT_DEVICE_REMINDER_PREFS,
                ...JSON.parse(localStorage.getItem(DEVICE_REMINDER_KEYS.PREFS))
            };
        } catch (error) {
            return { ...DEFAULT_DEVICE_REMINDER_PREFS };
        }
    },

    savePreferences(preferences) {
        localStorage.setItem(DEVICE_REMINDER_KEYS.PREFS, JSON.stringify({
            ...DEFAULT_DEVICE_REMINDER_PREFS,
            ...preferences
        }));
    },

    isDesktopPackaged() {
        return Boolean(window.DeadlineBuddyDeviceReminders);
    },

    prepareTask(task) {
        const dueAt = typeof Deadline !== 'undefined' && typeof Deadline.parseTaskDueDateTime === 'function'
            ? Deadline.parseTaskDueDateTime(task.dueDate, task.dueTime).toISOString()
            : task.dueDate;

        return {
            id: String(task.id),
            title: task.title,
            subjectId: task.subjectId || null,
            status: task.status || 'Pending',
            dueAt,
            url: `task-details.html?id=${encodeURIComponent(task.id)}`
        };
    },

    syncAllTasks() {
        if (!this.isDesktopPackaged() || typeof Storage === 'undefined') {
            this.renderSettings();
            return;
        }

        const tasks = Storage.getTasks().map(task => this.prepareTask(task));
        window.DeadlineBuddyDeviceReminders.syncTasks({
            tasks,
            preferences: this.getPreferences()
        }).then(() => this.renderSettings()).catch(error => {
            console.warn('Device reminder sync failed:', error);
            this.renderSettings('Needs app version', 'Open the Windows app version to use offline reminders while closed.');
        });
    },

    async sendTestNotification() {
        if (this.isDesktopPackaged()) {
            await window.DeadlineBuddyDeviceReminders.sendTestNotification();
            this.renderSettings('Test sent', 'A Windows test notification was sent.');
            if (typeof showFeedbackToast === 'function') showFeedbackToast('Test notification sent.', 'success');
            return;
        }

        if ('Notification' in window) {
            const permission = Notification.permission === 'granted'
                ? 'granted'
                : await Notification.requestPermission();

            if (permission === 'granted') {
                new Notification('Deadline Buddy', {
                    body: 'Test notification successful. Browser reminders work while Deadline Buddy is open.'
                });
                this.renderSettings('Browser test sent', 'This browser notification works while the page is open.');
                if (typeof showFeedbackToast === 'function') showFeedbackToast('Test notification sent.', 'success');
                return;
            }
        }

        this.renderSettings('Blocked', 'Notifications are blocked or not supported in this browser.');
        if (typeof showFeedbackToast === 'function') showFeedbackToast('Notifications are blocked or not supported in this browser.', 'warning');
    },

    patchStorageMethods() {
        if (typeof Storage === 'undefined' || Storage.__deviceReminderPatched) return;
        Storage.__deviceReminderPatched = true;

        const originalSaveTask = Storage.saveTask.bind(Storage);
        Storage.saveTask = data => {
            const task = originalSaveTask(data);
            this.syncAllTasks();
            return task;
        };

        const originalUpdateTask = Storage.updateTask.bind(Storage);
        Storage.updateTask = (id, data) => {
            originalUpdateTask(id, data);
            this.syncAllTasks();
        };

        const originalDeleteTask = Storage.deleteTask.bind(Storage);
        Storage.deleteTask = id => {
            const result = originalDeleteTask(id);
            this.syncAllTasks();
            return result;
        };

        const originalUpdateTaskStatus = Storage.updateTaskStatus.bind(Storage);
        Storage.updateTaskStatus = (id, status) => {
            originalUpdateTaskStatus(id, status);
            this.syncAllTasks();
        };
    },

    bindSettingsUi() {
        document.querySelectorAll('[data-device-reminder-pref]').forEach(input => {
            const prefs = this.getPreferences();
            input.checked = prefs[input.dataset.deviceReminderPref] !== false;
            input.addEventListener('change', () => {
                const nextPrefs = this.getPreferences();
                nextPrefs[input.dataset.deviceReminderPref] = input.checked;
                this.savePreferences(nextPrefs);
                this.syncAllTasks();
            });
        });

        document.querySelectorAll('.device-test-btn').forEach(testBtn => {
            testBtn.addEventListener('click', () => this.sendTestNotification());
        });

        const startupCheckbox = document.getElementById('startWithWindowsToggle');
        if (startupCheckbox && this.isDesktopPackaged()) {
            window.DeadlineBuddyDeviceReminders.getStartWithWindows().then(enabled => {
                startupCheckbox.checked = Boolean(enabled);
            });
            startupCheckbox.addEventListener('change', () => {
                window.DeadlineBuddyDeviceReminders.setStartWithWindows(startupCheckbox.checked);
            });
        }
    },

    renderSettings(statusOverride, messageOverride) {
        const statusText = document.getElementById('deviceReminderStatusText');
        const detailText = document.getElementById('deviceReminderDetailText');
        const platformText = document.getElementById('deviceReminderPlatformText');

        if (statusText) {
            statusText.textContent = statusOverride || (this.isDesktopPackaged() ? 'Enabled in Windows app' : 'Browser mode');
        }

        if (detailText) {
            detailText.textContent = messageOverride || (this.isDesktopPackaged()
                ? 'Offline device reminders are handled by the Windows tray app while Deadline Buddy is running.'
                : 'The website can show reminders while it is open. Use the Windows app for closed-screen offline reminders.');
        }

        if (platformText) {
            platformText.textContent = this.isDesktopPackaged()
                ? 'Offline Device Reminders: Active'
                : 'Offline Device Reminders: Available in packaged Windows app';
        }
    },

    init() {
        this.patchStorageMethods();
        this.bindSettingsUi();
        this.syncAllTasks();
        this.renderSettings();
    }
};

document.addEventListener('DOMContentLoaded', () => DeviceReminders.init());
