const express = require('express');
const path = require('path');
const { getDb, saveDb, getVapidKeys } = require('./db');
const {
    startScheduler,
    sendPushToSubscribers,
    syncTaskReminders,
    snoozeReminder,
    cancelTaskReminders,
    calculateReminderDate
} = require('./scheduler');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable JSON body parsing and CORS for local testing (e.g. Live Server on port 5500)
app.use(express.json());
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    if (req.method === 'OPTIONS') {
        return res.sendStatus(200);
    }
    next();
});

// Serve frontend static files
app.use(express.static(path.join(__dirname, '..')));

// ==================== REST APIS ====================

// 1. Status & Health
app.get('/api/status', (req, res) => {
    const db = getDb();
    res.json({
        ok: true,
        version: '3.0.0',
        timestamp: new Date().toISOString(),
        subscribersCount: (db.pushSubscriptions || []).length,
        remindersCount: (db.reminders || []).filter(r => r.status === 'scheduled').length,
        studySessionsCount: (db.studySessions || []).length,
        notificationsCount: (db.notifications || []).length
    });
});

// 2. VAPID Public Key for client subscription
app.get('/api/vapid-public-key', (req, res) => {
    const keys = getVapidKeys();
    res.json({ publicKey: keys.publicKey });
});

// 3. Push Subscriptions
app.post('/api/push/subscribe', (req, res) => {
    const { subscription, deviceType, userAgent, userId } = req.body;
    if (!subscription || !subscription.endpoint || !subscription.keys) {
        return res.status(400).json({ error: 'Valid subscription object required' });
    }

    const db = getDb();
    if (!db.pushSubscriptions) db.pushSubscriptions = [];

    const existingIndex = db.pushSubscriptions.findIndex(s => s.endpoint === subscription.endpoint);
    const subRecord = {
        id: 'sub-' + Date.now().toString(36),
        userId: userId || 'default',
        endpoint: subscription.endpoint,
        keys: subscription.keys,
        deviceType: deviceType || 'Unknown',
        userAgent: userAgent || 'Unknown',
        createdAt: new Date().toISOString(),
        lastActive: new Date().toISOString()
    };

    if (existingIndex >= 0) {
        db.pushSubscriptions[existingIndex] = {
            ...db.pushSubscriptions[existingIndex],
            ...subRecord,
            id: db.pushSubscriptions[existingIndex].id
        };
    } else {
        db.pushSubscriptions.push(subRecord);
    }

    saveDb();
    console.log(`[Push] Registered subscription for ${subRecord.deviceType}. Total active: ${db.pushSubscriptions.length}`);
    res.json({ ok: true, activeSubscriptions: db.pushSubscriptions.length });
});

app.post('/api/push/unsubscribe', (req, res) => {
    const { endpoint } = req.body;
    const db = getDb();
    if (db.pushSubscriptions) {
        db.pushSubscriptions = db.pushSubscriptions.filter(s => s.endpoint !== endpoint);
        saveDb();
    }
    res.json({ ok: true });
});

// 4. Test Web Push (Immediate Real Delivery)
app.post('/api/push/test', async (req, res) => {
    const { userId } = req.body;
    const db = getDb();
    const subsCount = (db.pushSubscriptions || []).length;

    if (subsCount === 0) {
        return res.status(400).json({
            ok: false,
            message: 'No push subscriptions found on server. Please enable notifications on your device first.'
        });
    }

    const payload = {
        type: 'system',
        title: 'Deadline Buddy Push Test',
        body: 'Real background Web Push notification delivered successfully! Offline reminders are active.',
        icon: 'images/icon-192.png',
        badge: 'images/icon-192.png',
        tag: 'deadline-buddy-test-' + Date.now(),
        data: {
            url: 'reminders.html?tab=settings',
            type: 'system'
        },
        actions: [
            { action: 'open', title: 'Open App' }
        ]
    };

    try {
        const stats = await sendPushToSubscribers(payload, userId || 'default');

        // Also add to in-app notification center
        if (!db.notifications) db.notifications = [];
        db.notifications.unshift({
            id: 'notif-' + Date.now(),
            userId: userId || 'default',
            type: 'system',
            title: payload.title,
            body: payload.body,
            url: payload.data.url,
            read: false,
            createdAt: new Date().toISOString()
        });
        saveDb();

        res.json({ ok: true, stats, message: 'Test push sent to device(s).' });
    } catch (err) {
        res.status(500).json({ ok: false, error: err.message });
    }
});

// 5. Reminders CRUD
app.get('/api/reminders', (req, res) => {
    const db = getDb();
    res.json(db.reminders || []);
});

app.post('/api/reminders', (req, res) => {
    const { title, body, scheduledAt, type, taskId, studyId, url, priority, relativeTime } = req.body;
    if (!title || !scheduledAt) {
        return res.status(400).json({ error: 'Title and scheduledAt are required' });
    }

    const db = getDb();
    if (!db.reminders) db.reminders = [];

    const newReminder = {
        id: 'rem-gen-' + Date.now().toString(36),
        userId: req.body.userId || 'default',
        taskId: taskId ? String(taskId) : null,
        studyId: studyId ? String(studyId) : null,
        type: type || 'general',
        title,
        body: body || '',
        scheduledAt: new Date(scheduledAt).toISOString(),
        relativeTime: relativeTime || 'custom',
        status: 'scheduled',
        url: url || 'reminders.html',
        priority: priority || 'Normal',
        createdAt: new Date().toISOString()
    };

    db.reminders.push(newReminder);
    saveDb();
    res.status(201).json(newReminder);
});

app.put('/api/reminders/:id/snooze', (req, res) => {
    const minutes = Number(req.body.minutes) || 15;
    const reminder = snoozeReminder(req.params.id, minutes);
    if (!reminder) {
        return res.status(404).json({ error: 'Reminder not found' });
    }
    res.json({ ok: true, reminder, message: `Reminder snoozed for ${minutes} minutes.` });
});

app.delete('/api/reminders/:id', (req, res) => {
    const db = getDb();
    const reminder = (db.reminders || []).find(r => r.id === req.params.id);
    if (reminder) {
        reminder.status = 'cancelled';
        reminder.cancelReason = 'User cancelled';
        saveDb();
    }
    res.json({ ok: true });
});

// 6. Study Sessions CRUD
app.get('/api/study-sessions', (req, res) => {
    const db = getDb();
    res.json(db.studySessions || []);
});

app.post('/api/study-sessions', (req, res) => {
    const { subjectId, subjectName, topic, date, startTime, endTime, repeat, reminderTiming, notes } = req.body;
    if (!topic || !date || !startTime) {
        return res.status(400).json({ error: 'Topic, date, and startTime are required.' });
    }

    const db = getDb();
    if (!db.studySessions) db.studySessions = [];

    const newSession = {
        id: 'study-' + Date.now().toString(36),
        userId: req.body.userId || 'default',
        subjectId: subjectId || null,
        subjectName: subjectName || 'General Study',
        topic,
        date,
        startTime,
        endTime: endTime || null,
        repeat: repeat || 'never',
        reminderTiming: reminderTiming || '15_min_before',
        notes: notes || '',
        status: 'scheduled',
        createdAt: new Date().toISOString()
    };

    db.studySessions.push(newSession);

    // Schedule study reminder
    const studyStartMs = new Date(`${date}T${startTime}:00`).getTime();
    let reminderMs = studyStartMs - 15 * 60 * 1000; // default 15m before
    if (reminderTiming === 'at_start') reminderMs = studyStartMs;
    else if (reminderTiming === '5_min_before') reminderMs = studyStartMs - 5 * 60 * 1000;
    else if (reminderTiming === '10_min_before') reminderMs = studyStartMs - 10 * 60 * 1000;
    else if (reminderTiming === '30_min_before') reminderMs = studyStartMs - 30 * 60 * 1000;
    else if (reminderTiming === '1_hour_before') reminderMs = studyStartMs - 60 * 60 * 1000;

    if (reminderMs > Date.now()) {
        if (!db.reminders) db.reminders = [];
        db.reminders.push({
            id: 'rem-study-' + newSession.id,
            userId: newSession.userId,
            studyId: newSession.id,
            type: 'study',
            title: `Study Session (${reminderTiming === 'at_start' ? 'Starting Now' : 'Starting Soon'})`,
            body: `${newSession.subjectName}: ${newSession.topic} starts at ${startTime}.`,
            scheduledAt: new Date(reminderMs).toISOString(),
            status: 'scheduled',
            url: `reminders.html?tab=study&id=${newSession.id}`,
            priority: 'Normal',
            createdAt: new Date().toISOString()
        });
    }

    saveDb();
    res.status(201).json(newSession);
});

app.put('/api/study-sessions/:id', (req, res) => {
    const db = getDb();
    const session = (db.studySessions || []).find(s => s.id === req.params.id);
    if (!session) return res.status(404).json({ error: 'Study session not found' });

    Object.assign(session, req.body);
    session.updatedAt = new Date().toISOString();
    saveDb();
    res.json(session);
});

app.delete('/api/study-sessions/:id', (req, res) => {
    const db = getDb();
    const session = (db.studySessions || []).find(s => s.id === req.params.id);
    if (session) {
        session.status = 'cancelled';
        // Cancel connected reminder
        (db.reminders || []).forEach(r => {
            if (r.studyId === session.id && r.status === 'scheduled') {
                r.status = 'cancelled';
                r.cancelReason = 'Study session deleted';
            }
        });
        saveDb();
    }
    res.json({ ok: true });
});

// 7. In-App Notification Center
app.get('/api/notifications', (req, res) => {
    const db = getDb();
    res.json(db.notifications || []);
});

app.put('/api/notifications/:id/read', (req, res) => {
    const db = getDb();
    const notif = (db.notifications || []).find(n => n.id === req.params.id);
    if (notif) {
        notif.read = true;
        saveDb();
    }
    res.json({ ok: true });
});

app.put('/api/notifications/read-all', (req, res) => {
    const db = getDb();
    (db.notifications || []).forEach(n => { n.read = true; });
    saveDb();
    res.json({ ok: true });
});

app.delete('/api/notifications/:id', (req, res) => {
    const db = getDb();
    db.notifications = (db.notifications || []).filter(n => n.id !== req.params.id);
    saveDb();
    res.json({ ok: true });
});

// 8. Notification Preferences
app.get('/api/notification-preferences', (req, res) => {
    const db = getDb();
    res.json(db.preferences || {});
});

app.put('/api/notification-preferences', (req, res) => {
    const db = getDb();
    db.preferences = { ...db.preferences, ...req.body };
    saveDb();
    res.json(db.preferences);
});

// 9. Client Task Sync (Syncs client tasks to server & auto-generates deadline reminders)
app.post('/api/sync-tasks', (req, res) => {
    const { tasks, deletedTaskIds } = req.body;
    const db = getDb();

    if (Array.isArray(deletedTaskIds)) {
        deletedTaskIds.forEach(id => cancelTaskReminders(id));
    }

    if (Array.isArray(tasks)) {
        db.tasks = tasks;
        tasks.forEach(task => {
            syncTaskReminders(task);
        });
    }

    saveDb();
    res.json({
        ok: true,
        activeTasks: (db.tasks || []).length,
        scheduledReminders: (db.reminders || []).filter(r => r.status === 'scheduled').length
    });
});

// Start Express server & Background Scheduler
app.listen(PORT, () => {
    console.log(`[Deadline Buddy] Push & API Server listening on port ${PORT}`);
    startScheduler(15000); // Poll due reminders every 15 seconds
});

module.exports = app;
