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

        // Prepare push payload
        const payload = {
            type: reminder.type,
            title: reminder.title || 'Deadline Buddy Alert',
            body: reminder.body || 'You have an academic reminder.',
            icon: 'images/icon-192.png',
            badge: 'images/icon-192.png',
            tag: `deadline-buddy-${reminder.id}`,
            data: {
                url: reminder.url || 'dashboard.html',
                reminderId: reminder.id,
                taskId: reminder.taskId,
                studyId: reminder.studyId,
                type: reminder.type
            },
            actions: [
                { action: 'open', title: 'Open' },
                { action: 'snooze_15', title: 'Snooze 15m' }
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
    const timePart = dueTimeStr || '23:59';
    const dueDateTime = new Date(`${dueDateStr}T${timePart}:00`);
    if (isNaN(dueDateTime.getTime())) return null;

    const baseMs = dueDateTime.getTime();

    switch (offsetKey) {
        case 'at_deadline':
        case 'at_due_time':
            return new Date(baseMs);
        case '10_min_before':
            return new Date(baseMs - 10 * 60 * 1000);
        case '30_min_before':
            return new Date(baseMs - 30 * 60 * 1000);
        case '1_hour_before':
            return new Date(baseMs - 60 * 60 * 1000);
        case '3_hours_before':
            return new Date(baseMs - 3 * 60 * 60 * 1000);
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

    const offsets = Array.isArray(task.reminderOffsets) && task.reminderOffsets.length > 0
        ? task.reminderOffsets
        : ['1_day_before', '1_hour_before'];

    const newReminders = [];

    offsets.forEach(offset => {
        const schedDate = calculateReminderDate(task.dueDate, task.dueTime, offset);
        if (!schedDate || schedDate.getTime() <= Date.now()) {
            return; // Ignore past dates
        }

        let label = offset.replace(/_/g, ' ');
        if (offset === '1_day_before') label = 'in 1 day';
        else if (offset === '1_hour_before') label = 'in 1 hour';
        else if (offset === 'at_deadline') label = 'now';

        const rem = {
            id: 'rem-' + task.id + '-' + offset + '-' + Date.now().toString(36),
            userId: task.userId || 'default',
            taskId: String(task.id),
            type: 'deadline',
            title: offset === 'at_deadline' ? 'Deadline Now Due!' : `Upcoming Deadline (${label})`,
            body: `${task.title} is due ${task.dueDate} at ${task.dueTime || '11:59 PM'}.`,
            scheduledAt: schedDate.toISOString(),
            relativeTime: offset,
            status: 'scheduled',
            url: `task-details.html?id=${task.id}`,
            targetId: String(task.id),
            priority: task.priority || 'Normal',
            createdAt: new Date().toISOString()
        };

        db.reminders.push(rem);
        newReminders.push(rem);
    });

    saveDb();
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
