const webpush = require('web-push');
const { getDb, saveDb, getVapidKeys } = require('./db');

const vapidKeys = getVapidKeys();
webpush.setVapidDetails(
    'mailto:notifications@deadlinebuddy.app',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

let schedulerInterval = null;

function isQuietHour(preferences) {
    if (!preferences.quietHoursEnabled) return false;
    const now = new Date();
    const currentMinutes = now.getHours() * 60 + now.getMinutes();

    const [startH, startM] = (preferences.quietHoursStart || '22:00').split(':').map(Number);
    const [endH, endM] = (preferences.quietHoursEnd || '06:00').split(':').map(Number);
    const startTotal = startH * 60 + startM;
    const endTotal = endH * 60 + endM;

    if (startTotal <= endTotal) {
        return currentMinutes >= startTotal && currentMinutes < endTotal;
    } else {
        // Crosses midnight (e.g. 22:00 to 06:00)
        return currentMinutes >= startTotal || currentMinutes < endTotal;
    }
}

async function sendPushToSubscribers(payload, targetUserId = 'default') {
    const db = getDb();
    const subs = (db.pushSubscriptions || []).filter(s => !targetUserId || s.userId === targetUserId);
    const deadSubEndpoints = new Set();
    let successCount = 0;
    let failCount = 0;

    const pushPayloadString = JSON.stringify(payload);

    for (const sub of subs) {
        try {
            await webpush.sendNotification({
                endpoint: sub.endpoint,
                keys: sub.keys
            }, pushPayloadString);
            successCount++;
        } catch (err) {
            failCount++;
            console.warn('[Push] Delivery notice for sub:', sub.endpoint.substring(0, 45), err.statusCode || err.message);
            // 404 Not Found or 410 Gone means the subscription is permanently inactive
            if (err.statusCode === 404 || err.statusCode === 410) {
                deadSubEndpoints.add(sub.endpoint);
            }
        }
    }

    if (deadSubEndpoints.size > 0) {
        db.pushSubscriptions = db.pushSubscriptions.filter(s => !deadSubEndpoints.has(s.endpoint));
        saveDb();
        console.log(`[Push] Removed ${deadSubEndpoints.size} expired/unsubscribed push endpoints.`);
    }

    return { total: subs.length, successCount, failCount };
}

async function processDueReminders() {
    const db = getDb();
    const now = new Date();
    const nowTime = now.getTime();

    const dueReminders = (db.reminders || []).filter(r => {
        if (r.status !== 'scheduled') return false;
        const schedTime = new Date(r.scheduledAt).getTime();
        return !isNaN(schedTime) && schedTime <= nowTime;
    });

    if (dueReminders.length === 0) return;

    console.log(`[Scheduler] Found ${dueReminders.length} due reminders at ${now.toISOString()}`);

    for (const reminder of dueReminders) {
        // Atomic lock
        reminder.status = 'processing';
        saveDb();

        // Validate association
        if (reminder.type === 'deadline' || reminder.type === 'overdue') {
            const task = (db.tasks || []).find(t => String(t.id) === String(reminder.taskId));
            if (!task || task.status === 'Completed') {
                reminder.status = 'cancelled';
                reminder.cancelReason = !task ? 'Task deleted' : 'Task completed';
                saveDb();
                continue;
            }
        } else if (reminder.type === 'study') {
            const study = (db.studySessions || []).find(s => String(s.id) === String(reminder.studyId));
            if (!study || study.status === 'completed' || study.status === 'skipped') {
                reminder.status = 'cancelled';
                reminder.cancelReason = !study ? 'Study session deleted' : 'Study completed/skipped';
                saveDb();
                continue;
            }
        }

        // Check user preferences
        const prefs = db.preferences || {};
        if (prefs.pushEnabled === false) {
            reminder.status = 'skipped_disabled';
            saveDb();
            continue;
        }

        if (reminder.type === 'deadline' && prefs.deadlineReminders === false) {
            reminder.status = 'skipped_disabled';
            saveDb();
            continue;
        }
        if (reminder.type === 'overdue' && prefs.overdueAlerts === false) {
            reminder.status = 'skipped_disabled';
            saveDb();
            continue;
        }
        if (reminder.type === 'study' && prefs.studyReminders === false) {
            reminder.status = 'skipped_disabled';
            saveDb();
            continue;
        }
        if (reminder.type === 'general' && prefs.generalReminders === false) {
            reminder.status = 'skipped_disabled';
            saveDb();
            continue;
        }

        // Check quiet hours (postpone by 20m if in quiet hours and not urgent)
        if (isQuietHour(prefs) && reminder.priority !== 'Urgent') {
            reminder.scheduledAt = new Date(nowTime + 20 * 60 * 1000).toISOString();
            reminder.status = 'scheduled';
            saveDb();
            continue;
        }

        // Prepare push payload - include reminderId at top level AND in data
        // so both the service worker snooze button and notificationclick handler can access it
        const payload = {
            type: reminder.type,
            title: reminder.title || 'Deadline Buddy Alert',
            body: reminder.body || 'You have an academic reminder.',
            icon: 'images/icon-192.png',
            badge: 'images/icon-192.png',
            tag: `deadline-buddy-${reminder.id}`,
            reminderId: reminder.id,
            url: reminder.url || 'dashboard.html',
            data: {
                url: reminder.url || 'dashboard.html',
                reminderId: reminder.id,
                taskId: reminder.taskId,
                studyId: reminder.studyId,
                type: reminder.type
            },
            actions: [
                { action: 'open', title: '📖 Open' },
                { action: 'snooze_15', title: '⏱ Snooze 15m' }
            ]
        };

        const delivery = await sendPushToSubscribers(payload, reminder.userId || 'default');

        // Create in-app notification record
        const notifRecord = {
            id: 'notif-' + Date.now() + '-' + Math.random().toString(36).substr(2, 6),
            userId: reminder.userId || 'default',
            type: reminder.type,
            title: reminder.title,
            body: reminder.body,
            url: reminder.url || 'dashboard.html',
            read: false,
            reminderId: reminder.id,
            createdAt: new Date().toISOString()
        };
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift(notifRecord);

        // Limit in-app notification history to 200 items
        if (db.notifications.length > 200) {
            db.notifications = db.notifications.slice(0, 200);
        }

        reminder.status = 'sent';
        reminder.sentAt = new Date().toISOString();
        reminder.deliveryStats = delivery;
        saveDb();
    }
}

function calculateReminderDate(dueDateStr, dueTimeStr, offsetKey) {
    if (!dueDateStr) return null;

    let dueDateTime;
    // Handle both 'YYYY-MM-DD' and full ISO strings (e.g. '2026-10-30T15:00:00.000Z')
    if (dueDateStr.includes('T')) {
        // Full ISO string - parse directly and extract local date+time parts
        dueDateTime = new Date(dueDateStr);
    } else {
        const timePart = dueTimeStr || '23:59';
        // Treat as a local datetime (not UTC) by appending timezone offset
        dueDateTime = new Date(`${dueDateStr}T${timePart}:00`);
    }

    if (isNaN(dueDateTime.getTime())) return null;

    const baseMs = dueDateTime.getTime();

    switch (offsetKey) {
        case 'at_deadline':
        case 'at_due_time':
            return new Date(baseMs);
        case '5_min_before':
            return new Date(baseMs - 5 * 60 * 1000);
        case '10_min_before':
            return new Date(baseMs - 10 * 60 * 1000);
        case '15_min_before':
            return new Date(baseMs - 15 * 60 * 1000);
        case '30_min_before':
            return new Date(baseMs - 30 * 60 * 1000);
        case '1_hour_before':
            return new Date(baseMs - 60 * 60 * 1000);
        case '3_hours_before':
            return new Date(baseMs - 3 * 60 * 60 * 1000);
        case '6_hours_before':
            return new Date(baseMs - 6 * 60 * 60 * 1000);
        case '12_hours_before':
            return new Date(baseMs - 12 * 60 * 60 * 1000);
        case '1_day_before':
            return new Date(baseMs - 24 * 60 * 60 * 1000);
        case '2_days_before':
            return new Date(baseMs - 48 * 60 * 60 * 1000);
        case '3_days_before':
            return new Date(baseMs - 72 * 60 * 60 * 1000);
        case '1_week_before':
            return new Date(baseMs - 7 * 24 * 60 * 60 * 1000);
        default:
            return null;
    }
}

function syncTaskReminders(task) {
    const db = getDb();
    if (!db.reminders) db.reminders = [];

    // Cancel existing scheduled reminders for this task to avoid duplicates on edits
    db.reminders.forEach(r => {
        if (String(r.taskId) === String(task.id) && r.status === 'scheduled') {
            r.status = 'cancelled';
            r.cancelReason = 'Task updated/rescheduled';
        }
    });

    if (task.status === 'Completed') {
        saveDb();
        return [];
    }

    // Resolve dueDate and dueTime - support both ISO strings and plain YYYY-MM-DD
    let dueDateStr = task.dueDate || '';
    let dueTimeStr = task.dueTime || '23:59';

    if (dueDateStr.includes('T')) {
        // Full ISO datetime string - extract local date and time parts
        const dt = new Date(dueDateStr);
        if (!isNaN(dt.getTime())) {
            const pad2 = n => String(n).padStart(2, '0');
            dueDateStr = `${dt.getFullYear()}-${pad2(dt.getMonth() + 1)}-${pad2(dt.getDate())}`;
            dueTimeStr = `${pad2(dt.getHours())}:${pad2(dt.getMinutes())}`;
        }
    }

    const offsets = Array.isArray(task.reminderOffsets) && task.reminderOffsets.length > 0
        ? task.reminderOffsets
        : ['1_day_before', '1_hour_before'];

    const newReminders = [];

    offsets.forEach(offset => {
        const schedDate = calculateReminderDate(dueDateStr, dueTimeStr, offset);
        if (!schedDate || schedDate.getTime() <= Date.now()) {
            return; // Ignore past dates
        }

        const friendlyLabels = {
            'at_deadline':    'at deadline time',
            '5_min_before':   'in 5 minutes',
            '10_min_before':  'in 10 minutes',
            '15_min_before':  'in 15 minutes',
            '30_min_before':  'in 30 minutes',
            '1_hour_before':  'in 1 hour',
            '3_hours_before': 'in 3 hours',
            '6_hours_before': 'in 6 hours',
            '12_hours_before':'in 12 hours',
            '1_day_before':   'tomorrow',
            '2_days_before':  'in 2 days',
            '3_days_before':  'in 3 days',
            '1_week_before':  'in 1 week'
        };
        const label = friendlyLabels[offset] || offset.replace(/_/g, ' ');

        // Format human-readable due time for notification body
        const dueHour = parseInt(dueTimeStr.split(':')[0], 10);
        const dueMin  = dueTimeStr.split(':')[1] || '00';
        const period  = dueHour >= 12 ? 'PM' : 'AM';
        const dispHour = dueHour % 12 || 12;
        const dueFriendly = `${dispHour}:${dueMin} ${period}`;

        const rem = {
            id:           'rem-' + task.id + '-' + offset + '-' + Date.now().toString(36),
            userId:       task.userId || 'default',
            taskId:       String(task.id),
            type:         'deadline',
            title:        offset === 'at_deadline'
                              ? `Deadline Now: ${task.title}`
                              : `Deadline ${label}: ${task.title}`,
            body:         `${task.title} is due on ${dueDateStr} at ${dueFriendly}.`,
            scheduledAt:  schedDate.toISOString(),
            relativeTime: offset,
            status:       'scheduled',
            url:          `task-details.html?id=${task.id}`,
            targetId:     String(task.id),
            priority:     task.priority || 'Normal',
            createdAt:    new Date().toISOString()
        };

        db.reminders.push(rem);
        newReminders.push(rem);
    });

    saveDb();
    console.log(`[Scheduler] Synced ${newReminders.length} reminder(s) for task ${task.id} ("${task.title}")`);
    return newReminders;
}

function snoozeReminder(reminderId, minutes) {
    const db = getDb();
    const reminder = (db.reminders || []).find(r => r.id === reminderId);
    if (!reminder) return null;

    const newTime = new Date(Date.now() + minutes * 60 * 1000).toISOString();
    reminder.scheduledAt = newTime;
    reminder.status = 'scheduled';
    reminder.snoozedAt = new Date().toISOString();
    reminder.snoozeMinutes = minutes;
    saveDb();
    return reminder;
}

function cancelTaskReminders(taskId) {
    const db = getDb();
    let count = 0;
    (db.reminders || []).forEach(r => {
        if (String(r.taskId) === String(taskId) && r.status === 'scheduled') {
            r.status = 'cancelled';
            r.cancelReason = 'Task deleted';
            count++;
        }
    });
    saveDb();
    return count;
}

function startScheduler(intervalMs = 15000) {
    if (schedulerInterval) clearInterval(schedulerInterval);
    console.log(`[Scheduler] Started reminder worker (poll every ${intervalMs / 1000}s).`);
    schedulerInterval = setInterval(() => {
        processDueReminders().catch(err => console.error('[Scheduler Error]:', err));
    }, intervalMs);
    // Initial immediate tick
    processDueReminders().catch(err => console.error('[Scheduler Error on start]:', err));
}

module.exports = {
    startScheduler,
    processDueReminders,
    sendPushToSubscribers,
    syncTaskReminders,
    snoozeReminder,
    cancelTaskReminders,
    calculateReminderDate
};
