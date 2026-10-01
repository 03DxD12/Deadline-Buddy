require('dotenv').config();

const path = require('path');
const express = require('express');
const cors = require('cors');
const webpush = require('web-push');
const Database = require('better-sqlite3');

const app = express();
const PORT = Number(process.env.PORT || 3001);
const DB_PATH = process.env.DB_PATH || path.join(__dirname, 'deadline-buddy.sqlite');
const CHECK_INTERVAL_MS = Number(process.env.REMINDER_CHECK_INTERVAL_MS || 30000);

if (!process.env.VAPID_PUBLIC_KEY || !process.env.VAPID_PRIVATE_KEY) {
    console.warn('Missing VAPID keys. Run: npm run web-push:keys, then copy the keys into .env');
}

webpush.setVapidDetails(
    process.env.VAPID_SUBJECT || 'mailto:deadline-buddy@example.com',
    process.env.VAPID_PUBLIC_KEY || 'missing_public_key',
    process.env.VAPID_PRIVATE_KEY || 'missing_private_key'
);

app.use(cors());
app.use(express.json({ limit: '1mb' }));

const db = new Database(DB_PATH);
db.pragma('journal_mode = WAL');

db.exec(`
CREATE TABLE IF NOT EXISTS push_subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    endpoint TEXT NOT NULL UNIQUE,
    p256dh TEXT NOT NULL,
    auth TEXT NOT NULL,
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS reminders (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    userId TEXT NOT NULL,
    taskId TEXT NOT NULL,
    taskTitle TEXT NOT NULL,
    taskUrl TEXT NOT NULL,
    dueAt TEXT NOT NULL,
    reminderType TEXT NOT NULL,
    scheduledAt TEXT NOT NULL,
    sentAt TEXT,
    status TEXT NOT NULL DEFAULT 'PENDING',
    createdAt TEXT NOT NULL,
    updatedAt TEXT NOT NULL,
    UNIQUE(userId, taskId, reminderType)
);
`);

const reminderOffsets = {
    ONE_DAY: 24 * 60 * 60 * 1000,
    ONE_HOUR: 60 * 60 * 1000,
    TWENTY_MINUTES: 20 * 60 * 1000,
    OVERDUE: 0
};

function nowIso() {
    return new Date().toISOString();
}

function cleanUserId(userId) {
    return String(userId || 'local-student').trim().slice(0, 120);
}

function validateTask(task) {
    if (!task || typeof task !== 'object') throw new Error('Task is required.');
    if (!task.id) throw new Error('Task ID is required.');
    if (!task.title) throw new Error('Task title is required.');
    const dueAt = new Date(task.dueAt);
    if (Number.isNaN(dueAt.getTime())) throw new Error('Valid due date is required.');
    return {
        id: String(task.id).slice(0, 80),
        title: String(task.title).slice(0, 180),
        dueAt,
        status: String(task.status || 'Pending'),
        url: String(task.url || `task-details.html?id=${encodeURIComponent(task.id)}`).slice(0, 240)
    };
}

function getReminderTypes(preferences = {}) {
    const prefs = {
        oneDay: preferences.oneDay !== false,
        oneHour: preferences.oneHour !== false,
        twentyMinutes: preferences.twentyMinutes !== false,
        overdue: preferences.overdue !== false
    };

    return [
        prefs.oneDay && 'ONE_DAY',
        prefs.oneHour && 'ONE_HOUR',
        prefs.twentyMinutes && 'TWENTY_MINUTES',
        prefs.overdue && 'OVERDUE'
    ].filter(Boolean);
}

function buildPayload(reminder) {
    const due = new Date(reminder.dueAt);
    const dueTime = due.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    const title = 'Deadline Buddy';
    const messages = {
        ONE_DAY: `${reminder.taskTitle} is due tomorrow at ${dueTime}.`,
        ONE_HOUR: `${reminder.taskTitle} is due in 1 hour.`,
        TWENTY_MINUTES: `Urgent: ${reminder.taskTitle} is due in 20 minutes.`,
        OVERDUE: `${reminder.taskTitle} is now overdue.`
    };

    return {
        title,
        body: messages[reminder.reminderType] || `${reminder.taskTitle} has a deadline reminder.`,
        taskId: reminder.taskId,
        url: reminder.taskUrl,
        tag: `deadline-${reminder.userId}-${reminder.taskId}-${reminder.reminderType}`
    };
}

app.get('/api/health', (req, res) => {
    res.json({ ok: true, service: 'Deadline Buddy Push Backend', time: nowIso() });
});

app.get('/api/push/public-key', (req, res) => {
    res.json({ publicKey: process.env.VAPID_PUBLIC_KEY || '' });
});

app.post('/api/push/subscribe', (req, res) => {
    const userId = cleanUserId(req.body.userId);
    const subscription = req.body.subscription;
    const keys = subscription && subscription.keys;

    if (!subscription || !subscription.endpoint || !keys || !keys.p256dh || !keys.auth) {
        return res.status(400).json({ error: 'Valid push subscription is required.' });
    }

    const timestamp = nowIso();
    db.prepare(`
        INSERT INTO push_subscriptions (userId, endpoint, p256dh, auth, createdAt, updatedAt)
        VALUES (?, ?, ?, ?, ?, ?)
        ON CONFLICT(endpoint) DO UPDATE SET
            userId = excluded.userId,
            p256dh = excluded.p256dh,
            auth = excluded.auth,
            updatedAt = excluded.updatedAt
    `).run(userId, subscription.endpoint, keys.p256dh, keys.auth, timestamp, timestamp);

    res.json({ ok: true });
});

app.post('/api/push/unsubscribe', (req, res) => {
    const userId = cleanUserId(req.body.userId);
    const endpoint = String(req.body.endpoint || '');
    db.prepare('DELETE FROM push_subscriptions WHERE userId = ? AND endpoint = ?').run(userId, endpoint);
    res.json({ ok: true });
});

app.post('/api/reminders/sync', (req, res) => {
    try {
        const userId = cleanUserId(req.body.userId);
        const task = validateTask(req.body.task);
        const timestamp = nowIso();

        db.prepare("UPDATE reminders SET status = 'CANCELLED', updatedAt = ? WHERE userId = ? AND taskId = ? AND sentAt IS NULL").run(timestamp, userId, task.id);

        if (task.status === 'Completed') return res.json({ ok: true, scheduled: 0 });

        const insert = db.prepare(`
            INSERT INTO reminders (userId, taskId, taskTitle, taskUrl, dueAt, reminderType, scheduledAt, status, createdAt, updatedAt)
            VALUES (?, ?, ?, ?, ?, ?, ?, 'PENDING', ?, ?)
            ON CONFLICT(userId, taskId, reminderType) DO UPDATE SET
                taskTitle = excluded.taskTitle,
                taskUrl = excluded.taskUrl,
                dueAt = excluded.dueAt,
                scheduledAt = excluded.scheduledAt,
                sentAt = NULL,
                status = 'PENDING',
                updatedAt = excluded.updatedAt
        `);

        let scheduled = 0;
        for (const type of getReminderTypes(req.body.preferences)) {
            const scheduledAt = new Date(task.dueAt.getTime() - reminderOffsets[type]).toISOString();
            insert.run(userId, task.id, task.title, task.url, task.dueAt.toISOString(), type, scheduledAt, timestamp, timestamp);
            scheduled += 1;
        }

        res.json({ ok: true, scheduled });
    } catch (error) {
        res.status(400).json({ error: error.message });
    }
});

app.post('/api/reminders/cancel', (req, res) => {
    const userId = cleanUserId(req.body.userId);
    const taskId = String(req.body.taskId || '');
    db.prepare("UPDATE reminders SET status = 'CANCELLED', updatedAt = ? WHERE userId = ? AND taskId = ? AND sentAt IS NULL").run(nowIso(), userId, taskId);
    res.json({ ok: true });
});

app.post('/api/push/test', async (req, res) => {
    const userId = cleanUserId(req.body.userId);
    const subscriptions = db.prepare('SELECT * FROM push_subscriptions WHERE userId = ?').all(userId);
    await sendToSubscriptions(subscriptions, {
        title: 'Deadline Buddy',
        body: 'Test notification: background reminders are connected.',
        url: 'reminders.html',
        tag: `deadline-test-${userId}-${Date.now()}`
    });
    res.json({ ok: true, sentTo: subscriptions.length });
});

async function sendToSubscriptions(subscriptions, payload) {
    await Promise.all(subscriptions.map(async subscription => {
        const pushSubscription = {
            endpoint: subscription.endpoint,
            keys: {
                p256dh: subscription.p256dh,
                auth: subscription.auth
            }
        };

        try {
            await webpush.sendNotification(pushSubscription, JSON.stringify(payload));
        } catch (error) {
            if (error.statusCode === 404 || error.statusCode === 410) {
                db.prepare('DELETE FROM push_subscriptions WHERE endpoint = ?').run(subscription.endpoint);
            } else {
                console.warn('Push send failed:', error.message);
            }
        }
    }));
}

async function processDueReminders() {
    const dueReminders = db.prepare(`
        SELECT * FROM reminders
        WHERE status = 'PENDING'
          AND sentAt IS NULL
          AND scheduledAt <= ?
        ORDER BY scheduledAt ASC
        LIMIT 50
    `).all(nowIso());

    for (const reminder of dueReminders) {
        const subscriptions = db.prepare('SELECT * FROM push_subscriptions WHERE userId = ?').all(reminder.userId);
        await sendToSubscriptions(subscriptions, buildPayload(reminder));
        db.prepare("UPDATE reminders SET sentAt = ?, status = 'SENT', updatedAt = ? WHERE id = ? AND sentAt IS NULL").run(nowIso(), nowIso(), reminder.id);
    }
}

setInterval(() => {
    processDueReminders().catch(error => console.warn('Reminder scheduler failed:', error.message));
}, CHECK_INTERVAL_MS);

app.listen(PORT, () => {
    console.log(`Deadline Buddy push backend running at http://localhost:${PORT}`);
});
