const { app, BrowserWindow, ipcMain, Menu, nativeImage, Notification, Tray, dialog } = require('electron');
const fs = require('fs');
const path = require('path');

const REMINDER_CHECK_INTERVAL_MS = 30 * 1000;
const DEFAULT_PREFERENCES = {
    oneDay: true,
    oneHour: true,
    twentyMinutes: true,
    overdue: true
};

let mainWindow;
let tray;
let isQuitting = false;
let reminderTimer = null;
let reminderState = {
    tasks: [],
    preferences: { ...DEFAULT_PREFERENCES },
    sent: {}
};

const gotLock = app.requestSingleInstanceLock();
if (!gotLock) {
    app.quit();
}

function getReminderStorePath() {
    return path.join(app.getPath('userData'), 'deadline-reminders.json');
}

function loadReminderState() {
    try {
        const saved = JSON.parse(fs.readFileSync(getReminderStorePath(), 'utf8'));
        reminderState = {
            tasks: Array.isArray(saved.tasks) ? saved.tasks : [],
            preferences: { ...DEFAULT_PREFERENCES, ...(saved.preferences || {}) },
            sent: saved.sent && typeof saved.sent === 'object' ? saved.sent : {}
        };
    } catch (error) {
        reminderState = {
            tasks: [],
            preferences: { ...DEFAULT_PREFERENCES },
            sent: {}
        };
    }
}

function saveReminderState() {
    fs.mkdirSync(path.dirname(getReminderStorePath()), { recursive: true });
    fs.writeFileSync(getReminderStorePath(), JSON.stringify(reminderState, null, 2));
}

function createWindow() {
    mainWindow = new BrowserWindow({
        width: 1200,
        height: 820,
        minWidth: 360,
        minHeight: 640,
        title: 'Deadline Buddy',
        icon: getAppIconPath(),
        webPreferences: {
            preload: path.join(__dirname, 'preload.js'),
            contextIsolation: true,
            nodeIntegration: false
        }
    });

    mainWindow.loadFile(path.join(__dirname, '..', 'index.html'));

    mainWindow.on('close', event => {
        if (isQuitting) return;
        event.preventDefault();
        mainWindow.hide();
        showNotification({
            title: 'Deadline Buddy is still running',
            body: 'Deadline reminders will continue from the Windows system tray.'
        });
    });
}

function getAppIconPath() {
    return path.join(__dirname, '..', 'images', 'deadline-buddy-logo.svg');
}

function createTray() {
    const icon = nativeImage.createFromPath(getAppIconPath());
    tray = new Tray(icon);
    tray.setToolTip('Deadline Buddy');
    updateTrayMenu();
    tray.on('double-click', showMainWindow);
}

function updateTrayMenu() {
    if (!tray) return;

    const contextMenu = Menu.buildFromTemplate([
        { label: 'Deadline Buddy', enabled: false },
        { type: 'separator' },
        { label: 'Open Deadline Buddy', click: showMainWindow },
        {
            label: 'Reminders Enabled',
            type: 'checkbox',
            checked: true,
            enabled: false
        },
        {
            label: 'Send Test Notification',
            click: () => showNotification({
                title: 'Deadline Buddy',
                body: 'Test notification successful. Offline reminders are working.'
            })
        },
        {
            label: 'Start with Windows',
            type: 'checkbox',
            checked: app.getLoginItemSettings().openAtLogin,
            click: menuItem => setStartWithWindows(menuItem.checked)
        },
        { type: 'separator' },
        { label: 'Exit', click: confirmExit }
    ]);

    tray.setContextMenu(contextMenu);
}

function showMainWindow(targetUrl) {
    if (!mainWindow) createWindow();
    if (targetUrl) mainWindow.loadFile(path.join(__dirname, '..', targetUrl));
    mainWindow.show();
    mainWindow.focus();
}

function confirmExit() {
    const result = dialog.showMessageBoxSync(mainWindow || undefined, {
        type: 'warning',
        title: 'Exit Deadline Buddy?',
        message: 'Deadline reminders will stop if you exit Deadline Buddy.',
        buttons: ['Cancel', 'Exit Deadline Buddy'],
        cancelId: 0,
        defaultId: 0
    });

    if (result === 1) {
        isQuitting = true;
        app.quit();
    }
}

function setStartWithWindows(enabled) {
    app.setLoginItemSettings({
        openAtLogin: Boolean(enabled),
        path: process.execPath
    });
    updateTrayMenu();
}

function showNotification({ title, body, taskUrl }) {
    if (!Notification.isSupported()) return;

    const notification = new Notification({
        title,
        body,
        icon: getAppIconPath()
    });

    notification.on('click', () => showMainWindow(taskUrl));
    notification.show();
}

function syncTasks(payload) {
    reminderState.tasks = Array.isArray(payload.tasks) ? payload.tasks : [];
    reminderState.preferences = {
        ...DEFAULT_PREFERENCES,
        ...(payload.preferences || {})
    };

    const validKeys = new Set();
    reminderState.tasks.forEach(task => {
        if (!task || task.status === 'Completed') return;
        const dueKey = getDueKey(task);
        ['ONE_DAY', 'ONE_HOUR', 'TWENTY_MINUTES', 'OVERDUE'].forEach(type => {
            validKeys.add(`${task.id}|${type}|${dueKey}`);
        });
    });

    Object.keys(reminderState.sent).forEach(key => {
        if (!validKeys.has(key)) delete reminderState.sent[key];
    });

    saveReminderState();
    processDueReminders();
}

function getDueKey(task) {
    const dueAt = new Date(task.dueAt);
    return Number.isNaN(dueAt.getTime()) ? String(task.dueAt || '') : dueAt.toISOString();
}

function getReminderToSend(task, now) {
    if (!task || task.status === 'Completed') return null;

    const dueAt = new Date(task.dueAt);
    if (Number.isNaN(dueAt.getTime())) return null;

    const diffMs = dueAt.getTime() - now.getTime();
    const prefs = reminderState.preferences || DEFAULT_PREFERENCES;

    if (diffMs <= 0 && prefs.overdue) {
        return {
            type: 'OVERDUE',
            title: 'Deadline Buddy',
            body: `${task.title} is now overdue.`
        };
    }

    if (diffMs <= 20 * 60 * 1000 && prefs.twentyMinutes) {
        const minutes = Math.max(1, Math.ceil(diffMs / 60000));
        return {
            type: 'TWENTY_MINUTES',
            title: 'Deadline Buddy',
            body: `${task.title} is due in ${minutes} minute${minutes === 1 ? '' : 's'}.`
        };
    }

    if (diffMs <= 60 * 60 * 1000 && prefs.oneHour) {
        return {
            type: 'ONE_HOUR',
            title: 'Deadline Buddy',
            body: `${task.title} is due in about 1 hour.`
        };
    }

    if (diffMs <= 24 * 60 * 60 * 1000 && prefs.oneDay) {
        const hours = Math.max(1, Math.ceil(diffMs / 3600000));
        return {
            type: 'ONE_DAY',
            title: 'Deadline Buddy',
            body: `${task.title} is due in about ${hours} hour${hours === 1 ? '' : 's'}.`
        };
    }

    return null;
}

function processDueReminders() {
    const now = new Date();
    let changed = false;

    reminderState.tasks.forEach(task => {
        const reminder = getReminderToSend(task, now);
        if (!reminder) return;

        const key = `${task.id}|${reminder.type}|${getDueKey(task)}`;
        if (reminderState.sent[key]) return;

        showNotification({
            title: reminder.title,
            body: reminder.body,
            taskUrl: task.url || 'reminders.html'
        });
        reminderState.sent[key] = new Date().toISOString();
        changed = true;
    });

    if (changed) saveReminderState();
}

function startReminderLoop() {
    if (reminderTimer) clearInterval(reminderTimer);
    processDueReminders();
    reminderTimer = setInterval(processDueReminders, REMINDER_CHECK_INTERVAL_MS);
}

app.on('second-instance', () => showMainWindow());

app.whenReady().then(() => {
    loadReminderState();
    createWindow();
    createTray();
    startReminderLoop();
});

app.on('before-quit', () => {
    isQuitting = true;
});

app.on('window-all-closed', event => {
    event.preventDefault();
});

ipcMain.handle('deadline:sync-tasks', (event, payload) => {
    syncTasks(payload || {});
    return { ok: true };
});

ipcMain.handle('deadline:test-notification', () => {
    showNotification({
        title: 'Deadline Buddy',
        body: 'Test notification successful. Offline reminders are working.'
    });
    return { ok: true };
});

ipcMain.handle('deadline:set-start-with-windows', (event, enabled) => {
    setStartWithWindows(enabled);
    return { ok: true, enabled: app.getLoginItemSettings().openAtLogin };
});

ipcMain.handle('deadline:get-start-with-windows', () => app.getLoginItemSettings().openAtLogin);
