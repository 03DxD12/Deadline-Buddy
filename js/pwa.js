/**
 * PWA AND WEB PUSH CLIENT - Deadline Buddy
 * Registers the service worker, subscribes the browser for push reminders,
 * and syncs task reminder schedules to the optional Node backend.
 */

const PUSH_STORAGE_KEYS = {
    API_BASE: 'deadlinebuddy_push_api_base',
    ENABLED: 'deadlinebuddy_push_enabled',
    REMINDER_PREFS: 'deadlinebuddy_reminder_preferences'
};

const DEFAULT_REMINDER_PREFS = {
    oneDay: true,
    oneHour: true,
    twentyMinutes: true,
    overdue: true
};

const PwaPush = {
    registration: null,

    getApiBase() {
        return localStorage.getItem(PUSH_STORAGE_KEYS.API_BASE) || 'http://localhost:3001';
    },

    getUserId() {
        if (typeof Storage === 'undefined') return 'local-student';
        const user = Storage.getUser();
        return user.username || user.name || user.email || 'local-student';
    },

    getPreferences() {
        try {
            return { ...DEFAULT_REMINDER_PREFS, ...JSON.parse(localStorage.getItem(PUSH_STORAGE_KEYS.REMINDER_PREFS)) };
        } catch (error) {
            return { ...DEFAULT_REMINDER_PREFS };
        }
    },

    savePreferences(preferences) {
        localStorage.setItem(PUSH_STORAGE_KEYS.REMINDER_PREFS, JSON.stringify({ ...DEFAULT_REMINDER_PREFS, ...preferences }));
    },

    async init() {
        if (!('serviceWorker' in navigator)) {
            this.renderSettings('Not supported', 'This browser does not support service workers.');
            return;
        }

        try {
            this.registration = await navigator.serviceWorker.register('./service-worker.js');
            await navigator.serviceWorker.ready;
            this.patchStorageMethods();
            this.bindSettingsUi();
            this.renderSettings();
        } catch (error) {
            console.warn('Service worker registration failed:', error);
            this.renderSettings('Setup problem', 'Deadline Buddy could not register the service worker.');
        }
    },

    bindSettingsUi() {
        const enableBtn = document.getElementById('enablePushBtn');
        const testBtn = document.getElementById('sendTestPushBtn');
        const disableBtn = document.getElementById('disablePushBtn');
        const apiInput = document.getElementById('pushApiBaseInput');

        if (apiInput) {
            apiInput.value = this.getApiBase();
            apiInput.addEventListener('change', () => {
                localStorage.setItem(PUSH_STORAGE_KEYS.API_BASE, apiInput.value.trim() || 'http://localhost:3001');
                this.renderSettings();
            });
        }

        document.querySelectorAll('[data-reminder-pref]').forEach(input => {
            const prefs = this.getPreferences();
            input.checked = prefs[input.dataset.reminderPref] !== false;
            input.addEventListener('change', () => {
                const nextPrefs = this.getPreferences();
                nextPrefs[input.dataset.reminderPref] = input.checked;
                this.savePreferences(nextPrefs);
                this.syncAllTasks();
            });
        });

        if (enableBtn) enableBtn.addEventListener('click', () => this.enableNotifications());
        if (testBtn) testBtn.addEventListener('click', () => this.sendTestNotification());
        if (disableBtn) disableBtn.addEventListener('click', () => this.disableNotifications());
    },

    async enableNotifications() {
        if (!('Notification' in window) || !('PushManager' in window)) {
            this.renderSettings('Not supported', 'This browser cannot use Web Push notifications.');
            return;
        }

        const wantsNotifications = confirm('Deadline Buddy uses notifications to remind you about deadlines even when the app tab is closed. Continue?');
        if (!wantsNotifications) return;

        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
            localStorage.setItem(PUSH_STORAGE_KEYS.ENABLED, 'false');
            this.renderSettings('Blocked', 'Notifications are currently blocked. You can still use Deadline Buddy, but background deadline alerts will not appear.');
            return;
        }

        try {
            const publicKeyResponse = await fetch(`${this.getApiBase()}/api/push/public-key`);
            if (!publicKeyResponse.ok) throw new Error('Backend public key request failed.');
            const { publicKey } = await publicKeyResponse.json();
            const subscription = await this.registration.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: this.urlBase64ToUint8Array(publicKey)
            });

            await this.postJson('/api/push/subscribe', {
                userId: this.getUserId(),
                subscription,
                preferences: this.getPreferences()
            });

            localStorage.setItem(PUSH_STORAGE_KEYS.ENABLED, 'true');
            await this.syncAllTasks();
            this.renderSettings('Enabled', 'Deadline Buddy can now send reminders even when the app window is closed.');
        } catch (error) {
            console.warn('Push setup failed:', error);
            this.renderSettings('Backend not ready', 'Start the Node backend first, then try enabling deadline notifications again.');
        }
    },

    async disableNotifications() {
        try {
            const subscription = await this.registration.pushManager.getSubscription();
            if (subscription) {
                await this.postJson('/api/push/unsubscribe', { userId: this.getUserId(), endpoint: subscription.endpoint });
                await subscription.unsubscribe();
            }
        } catch (error) {
            console.warn('Disable push failed:', error);
        }

        localStorage.setItem(PUSH_STORAGE_KEYS.ENABLED, 'false');
        this.renderSettings('Disabled', 'Background deadline notifications are turned off.');
    },

    async sendTestNotification() {
        try {
            await this.postJson('/api/push/test', { userId: this.getUserId() });
            this.renderSettings('Test sent', 'A real Web Push test notification was sent through the backend.');
        } catch (error) {
            console.warn('Test push failed:', error);
            this.renderSettings('Test failed', 'The backend must be running before a test push can be sent.');
        }
    },

    async syncAllTasks() {
        if (typeof Storage === 'undefined') return;
        const tasks = Storage.getTasks();
        await Promise.all(tasks.map(task => this.syncTask(task)));
    },

    async syncTask(task) {
        if (!task || localStorage.getItem(PUSH_STORAGE_KEYS.ENABLED) !== 'true') return;
        try {
            await this.postJson('/api/reminders/sync', {
                userId: this.getUserId(),
                task: this.prepareTaskForBackend(task),
                preferences: this.getPreferences()
            });
        } catch (error) {
            console.warn('Reminder sync failed:', error);
        }
    },

    async cancelTask(taskId) {
        if (!taskId || localStorage.getItem(PUSH_STORAGE_KEYS.ENABLED) !== 'true') return;
        try {
            await this.postJson('/api/reminders/cancel', { userId: this.getUserId(), taskId: String(taskId) });
        } catch (error) {
            console.warn('Reminder cancel failed:', error);
        }
    },

    prepareTaskForBackend(task) {
        const dueAt = typeof Deadline !== 'undefined' && typeof Deadline.parseTaskDueDateTime === 'function'
            ? Deadline.parseTaskDueDateTime(task.dueDate, task.dueTime).toISOString()
            : task.dueDate;

        return {
            id: String(task.id),
            title: task.title,
            dueAt,
            status: task.status || 'Pending',
            url: `task-details.html?id=${encodeURIComponent(task.id)}`
        };
    },

    async postJson(path, payload) {
        const response = await fetch(`${this.getApiBase()}${path}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error(`Request failed: ${response.status}`);
        return response.json();
    },

    patchStorageMethods() {
        if (typeof Storage === 'undefined' || Storage.__pushPatched) return;
        Storage.__pushPatched = true;

        const originalSaveTask = Storage.saveTask.bind(Storage);
        Storage.saveTask = data => {
            const task = originalSaveTask(data);
            this.syncTask(task);
            return task;
        };

        const originalUpdateTask = Storage.updateTask.bind(Storage);
        Storage.updateTask = (id, data) => {
            const before = Storage.getTaskById(id);
            originalUpdateTask(id, data);
            const after = Storage.getTaskById(id);
            if (after && after.status === 'Completed') this.cancelTask(id);
            else if (after) this.syncTask(after);
            else if (before) this.cancelTask(id);
        };

        const originalDeleteTask = Storage.deleteTask.bind(Storage);
        Storage.deleteTask = id => {
            this.cancelTask(id);
            return originalDeleteTask(id);
        };

        const originalUpdateTaskStatus = Storage.updateTaskStatus.bind(Storage);
        Storage.updateTaskStatus = (id, status) => {
            originalUpdateTaskStatus(id, status);
            const task = Storage.getTaskById(id);
            if (status === 'Completed') this.cancelTask(id);
            else if (task) this.syncTask(task);
        };
    },

    renderSettings(statusOverride, messageOverride) {
        const statusText = document.getElementById('pushStatusText');
        const detailText = document.getElementById('pushDetailText');
        const enabled = localStorage.getItem(PUSH_STORAGE_KEYS.ENABLED) === 'true';
        const permission = 'Notification' in window ? Notification.permission : 'unsupported';

        if (statusText) {
            statusText.textContent = statusOverride || (enabled && permission === 'granted' ? 'Enabled' : permission === 'denied' ? 'Blocked' : 'Not enabled');
        }

        if (detailText) {
            detailText.textContent = messageOverride || (enabled && permission === 'granted'
                ? 'Deadline Buddy can send reminders through the backend when the app tab is closed.'
                : 'Enable deadline notifications to allow real Web Push reminders.');
        }
    },

    urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - base64String.length % 4) % 4);
        const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
        const rawData = atob(base64);
        return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
    }
};

document.addEventListener('DOMContentLoaded', () => {
    PwaPush.init();
});
