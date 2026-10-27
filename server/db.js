const fs = require('fs');
const path = require('path');
const webpush = require('web-push');

const DB_PATH = path.join(__dirname, '..', 'data', 'deadline-buddy.json');
const VAPID_PATH = path.join(__dirname, '..', 'data', 'vapid.json');

const DEFAULT_PREFERENCES = {
    userId: 'default',
    pushEnabled: true,
    deadlineReminders: true,
    studyReminders: true,
    overdueAlerts: true,
    generalReminders: true,
    dailySummary: false,
    quietHoursEnabled: false,
    quietHoursStart: '22:00',
    quietHoursEnd: '06:00',
    sound: true,
    vibration: true
};

const DEFAULT_STATE = {
    tasks: [],
    reminders: [],
    studySessions: [],
    pushSubscriptions: [],
    notifications: [],
    preferences: { ...DEFAULT_PREFERENCES }
};

let dbCache = null;

function ensureDir(filePath) {
    const dir = path.dirname(filePath);
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
    }
}

function loadVapidKeys() {
    ensureDir(VAPID_PATH);
    if (fs.existsSync(VAPID_PATH)) {
        try {
            return JSON.parse(fs.readFileSync(VAPID_PATH, 'utf8'));
        } catch (e) {
            console.warn('[DB] Could not parse existing vapid.json, regenerating...');
        }
    }
    const newKeys = webpush.generateVAPIDKeys();
    fs.writeFileSync(VAPID_PATH, JSON.stringify(newKeys, null, 2), 'utf8');
    return newKeys;
}

function loadDb() {
    if (dbCache) return dbCache;
    ensureDir(DB_PATH);
    if (fs.existsSync(DB_PATH)) {
        try {
            const raw = fs.readFileSync(DB_PATH, 'utf8');
            dbCache = { ...DEFAULT_STATE, ...JSON.parse(raw) };
            if (!dbCache.preferences) dbCache.preferences = { ...DEFAULT_PREFERENCES };
            return dbCache;
        } catch (e) {
            console.error('[DB] Failed reading db, using default state:', e);
        }
    }
    dbCache = JSON.parse(JSON.stringify(DEFAULT_STATE));
    saveDb();
    return dbCache;
}

function saveDb() {
    if (!dbCache) return;
    ensureDir(DB_PATH);
    const tmpPath = DB_PATH + '.tmp';
    const jsonStr = JSON.stringify(dbCache, null, 2);
    fs.writeFileSync(tmpPath, jsonStr, 'utf8');
    try {
        fs.renameSync(tmpPath, DB_PATH);
    } catch (e) {
        // Fallback for Windows cross-process rename collisions
        fs.copyFileSync(tmpPath, DB_PATH);
        try { fs.unlinkSync(tmpPath); } catch (_) {}
    }
}

const vapidKeys = loadVapidKeys();

module.exports = {
    getDb: loadDb,
    saveDb,
    getVapidKeys: () => vapidKeys,
    DEFAULT_PREFERENCES
};
