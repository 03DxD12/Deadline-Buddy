/**
 * PUSH NOTIFICATION & BACKEND REMINDER MANAGER - Deadline Buddy
 * Handles Web Push subscription, VAPID handshakes, server synchronization,
 * study session reminders, and in-app Notification Center integration.
 *
 * PWA Architecture:
 * - Service Worker + Push API for background delivery when app is closed.
 * - IndexedDB & Local Storage synchronization for offline-first resilience.
 */

const PushManagerService = (function() {
    const API_BASE = (function() {
        if (window.location.protocol === 'file:') return 'http://127.0.0.1:3000';
        if (window.location.port === '5500') return 'http://127.0.0.1:3000';
        return '';
    })();

    function urlBase64ToUint8Array(base64String) {
        const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
        const base64 = (base64String + padding).replace(/\-/g, '+').replace(/_/g, '/');
        const rawData = window.atob(base64);
        const outputArray = new Uint8Array(rawData.length);
        for (let i = 0; i < rawData.length; ++i) {
            outputArray[i] = rawData.charCodeAt(i);
        }
        return outputArray;
    }

    function isPushSupported() {
        return 'serviceWorker' in navigator && 'PushManager' in window && 'Notification' in window;
    }

    function getDeviceType() {
        const ua = navigator.userAgent;
        if (/android/i.test(ua)) return 'Android Device';
        if (/ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && window.innerWidth >= 768)) return 'iPadOS Device';
        if (/iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1)) return 'iOS Device';
        if (/windows/i.test(ua)) return 'Windows PC';
        if (/mac/i.test(ua)) return 'Mac';
        if (/linux/i.test(ua)) return 'Linux';
        return 'Web Client';
    }

    async function getServiceWorkerRegistration() {
        if (!('serviceWorker' in navigator)) return null;
        try {
            return await navigator.serviceWorker.ready;
        } catch (e) {
            return null;
        }
    }

    async function getCurrentSubscription() {
        const reg = await getServiceWorkerRegistration();
        if (!reg || !reg.pushManager) return null;
        try {
            return await reg.pushManager.getSubscription();
        } catch (e) {
            return null;
        }
    }

    async function fetchVapidPublicKey() {
        try {
            const res = await fetch(`${API_BASE}/api/vapid-public-key`);
            if (!res.ok) throw new Error('Failed to fetch VAPID key');
            const data = await res.json();
            return data.publicKey;
        } catch (e) {
            console.warn('[PushManager] VAPID key fetch note:', e.message);
            return null;
        }
    }

    async function subscribeDevice(customUserId = 'default') {
        if (!isPushSupported()) {
            const ua = navigator.userAgent;
            const isApple = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
            if (isApple) {
                throw new Error('On iPhone and iPad, Apple requires Deadline Buddy to be added to your Home Screen to enable notifications. Tap Share -> "Add to Home Screen", then open from your Home Screen.');
            }
            throw new Error('Push notifications are not supported on this browser or device.');
        }

        // Check current permission before requesting
        const currentPerm = Notification.permission;
        if (currentPerm === 'denied') {
            throw new Error('Notifications are blocked. Please enable them in your browser or device settings and try again.');
        }

        if (currentPerm !== 'granted') {
            const perm = await Notification.requestPermission();
            if (perm !== 'granted') {
                throw new Error('Notification permission was not granted.');
            }
        }

        const reg = await getServiceWorkerRegistration();
        if (!reg) {
            throw new Error('Service worker is not active. Please refresh the page and try again.');
        }

        const publicKey = await fetchVapidPublicKey();
        if (!publicKey) {
            throw new Error('Could not retrieve push keys from server. Make sure the Deadline Buddy server is running on port 3000.');
        }

        const convertedKey = urlBase64ToUint8Array(publicKey);
        let subscription = await reg.pushManager.getSubscription();

        if (!subscription) {
            subscription = await reg.pushManager.subscribe({
                userVisibleOnly: true,
                applicationServerKey: convertedKey
            });
        } else {
            // Verify the existing subscription uses the same key; resubscribe if not
            const existingKey = btoa(String.fromCharCode(...new Uint8Array(subscription.options.applicationServerKey)));
            const newKeyBase64 = btoa(String.fromCharCode(...convertedKey));
            if (existingKey !== newKeyBase64) {
                await subscription.unsubscribe();
                subscription = await reg.pushManager.subscribe({
                    userVisibleOnly: true,
                    applicationServerKey: convertedKey
                });
            }
        }

        // Send subscription to server
        const payload = {
            subscription: subscription.toJSON(),
            deviceType: getDeviceType(),
            userAgent: navigator.userAgent,
            userId: customUserId || 'default'
        };

        const res = await fetch(`${API_BASE}/api/push/subscribe`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        if (!res.ok) {
            throw new Error('Failed saving push subscription to server. Server may not be running.');
        }

        localStorage.setItem('deadlinebuddy_push_subscribed', 'true');
        localStorage.setItem('deadlinebuddy_push_ready', 'true');
        return subscription;
    }

    async function unsubscribeDevice() {
        const sub = await getCurrentSubscription();
        if (sub) {
            try {
                await fetch(`${API_BASE}/api/push/unsubscribe`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ endpoint: sub.endpoint })
                });
            } catch (_) {}
            await sub.unsubscribe();
        }
        localStorage.removeItem('deadlinebuddy_push_subscribed');
    }

    async function sendTestPush() {
        const res = await fetch(`${API_BASE}/api/push/test`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ userId: 'default' })
        });
        const data = await res.json();
        if (!res.ok) {
            throw new Error(data.message || data.error || 'Test notification failed');
        }
        return data;
    }

    async function syncTasksToServer(tasks, deletedIds = []) {
        if (!Array.isArray(tasks)) return;
        try {
            await fetch(`${API_BASE}/api/sync-tasks`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ tasks, deletedTaskIds: deletedIds })
            });
        } catch (e) {
            // Silently wait for next sync if offline
        }
    }

    async function snoozeReminder(reminderId, minutes = 15) {
        const res = await fetch(`${API_BASE}/api/reminders/${encodeURIComponent(reminderId)}/snooze`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ minutes })
        });
        return await res.json();
    }

    async function getScheduledReminders() {
        try {
            const res = await fetch(`${API_BASE}/api/reminders`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async function getStudySessions() {
        try {
            const res = await fetch(`${API_BASE}/api/study-sessions`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async function createStudySession(sessionData) {
        const res = await fetch(`${API_BASE}/api/study-sessions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(sessionData)
        });
        if (!res.ok) {
            const err = await res.json();
            throw new Error(err.error || 'Failed creating study session');
        }
        return await res.json();
    }

    async function deleteStudySession(id) {
        const res = await fetch(`${API_BASE}/api/study-sessions/${encodeURIComponent(id)}`, {
            method: 'DELETE'
        });
        return await res.json();
    }

    async function getNotificationHistory() {
        try {
            const res = await fetch(`${API_BASE}/api/notifications`);
            if (!res.ok) return [];
            return await res.json();
        } catch (e) {
            return [];
        }
    }

    async function markNotificationRead(id) {
        await fetch(`${API_BASE}/api/notifications/${encodeURIComponent(id)}/read`, { method: 'PUT' });
    }

    async function markAllNotificationsRead() {
        await fetch(`${API_BASE}/api/notifications/read-all`, { method: 'PUT' });
    }

    async function deleteNotification(id) {
        await fetch(`${API_BASE}/api/notifications/${encodeURIComponent(id)}`, { method: 'DELETE' });
    }

    async function getPreferences() {
        try {
            const res = await fetch(`${API_BASE}/api/notification-preferences`);
            if (!res.ok) return null;
            return await res.json();
        } catch (e) {
            return null;
        }
    }

    async function updatePreferences(prefs) {
        const res = await fetch(`${API_BASE}/api/notification-preferences`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(prefs)
        });
        return await res.json();
    }

    function updateAppBadge(unreadCount) {
        if ('setAppBadge' in navigator) {
            if (unreadCount > 0) {
                navigator.setAppBadge(unreadCount).catch(() => {});
            } else {
                navigator.clearAppBadge().catch(() => {});
            }
        }
    }

    // Auto-sync tasks whenever online
    window.addEventListener('online', () => {
        if (typeof Storage !== 'undefined' && typeof Storage.getTasks === 'function') {
            syncTasksToServer(Storage.getTasks());
        }
    });

    return {
        API_BASE,
        isPushSupported,
        getDeviceType,
        getCurrentSubscription,
        subscribeDevice,
        unsubscribeDevice,
        sendTestPush,
        syncTasksToServer,
        snoozeReminder,
        getScheduledReminders,
        getStudySessions,
        createStudySession,
        deleteStudySession,
        getNotificationHistory,
        markNotificationRead,
        markAllNotificationsRead,
        deleteNotification,
        getPreferences,
        updatePreferences,
        updateAppBadge
    };
})();

window.PushManagerService = PushManagerService;
window.DeadlinePush = PushManagerService;
