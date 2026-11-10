const CACHE_NAME = 'deadline-buddy-shell-v22';
const APP_SHELL = [
    './',
    './index.html',
    './dashboard.html',
    './tasks.html',
    './task-form.html',
    './task-details.html',
    './subjects.html',
    './calendar.html',
    './reminders.html',
    './profile.html',
    './css/style.css',
    './css/fontawesome.min.css',
    './js/app.js',
    './js/deadline.js',
    './js/notifications.js',
    './js/local-notifications.js',
    './js/push.js',
    './js/pwa.js',
    './js/storage.js',
    './apple-touch-icon.png',
    './images/deadline-buddy-logo.svg',
    './images/icon-192.png',
    './images/icon-512.png',
    './images/subject-books.svg',
    './webfonts/fa-brands-400.woff2',
    './webfonts/fa-regular-400.woff2',
    './webfonts/fa-solid-900.woff2',
    './webfonts/fa-v4compatibility.woff2',
    './manifest.json'
];

// Pre-cache core application shell with resilient fallback
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(async cache => {
                const cachePromises = APP_SHELL.map(async url => {
                    try {
                        const response = await fetch(url);
                        if (response.ok) {
                            await cache.put(url, response);
                        }
                    } catch (err) {
                        console.warn('[SW] Pre-cache item warning:', url, err);
                    }
                });
                await Promise.all(cachePromises);
            })
            .then(() => self.skipWaiting())
    );
});

// Clean up stale caches from previous versions
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            ))
            .then(() => self.clients.claim())
    );
});

// Intelligent fetch handling: Cache-first for static assets, Network-first for pages
self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    const url = new URL(event.request.url);

    // Dynamic REST APIs and remote DB endpoints must never be cached by service worker
    if (url.pathname.startsWith('/api/') || url.hostname.includes('supabase.co')) {
        return;
    }

    // HTML Navigation requests (Pages)
    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request)
                .then(response => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return response;
                })
                .catch(async () => {
                    const cached = await caches.match(event.request);
                    if (cached) return cached;
                    // Fallback to dashboard or index
                    const fallback = await caches.match('./dashboard.html') || await caches.match('./index.html');
                    return fallback;
                })
        );
        return;
    }

    // Static Assets (Fonts, CSS, JS, Images, Icons)
    const isStaticAsset = url.pathname.match(/\.(css|js|woff2|woff|ttf|svg|png|jpg|jpeg|webp|ico)$/) ||
                          url.pathname.includes('/css/') ||
                          url.pathname.includes('/js/') ||
                          url.pathname.includes('/images/') ||
                          url.pathname.includes('/webfonts/');

    if (isStaticAsset) {
        event.respondWith(
            caches.match(event.request).then(cached => {
                if (cached) {
                    // Return cached asset immediately and update in background
                    fetch(event.request).then(res => {
                        if (res && res.status === 200) {
                            caches.open(CACHE_NAME).then(cache => cache.put(event.request, res));
                        }
                    }).catch(() => {/* Offline, ignore */});
                    return cached;
                }

                return fetch(event.request).then(response => {
                    if (response && response.status === 200) {
                        const copy = response.clone();
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                    }
                    return response;
                }).catch(() => caches.match('./images/deadline-buddy-logo.svg'));
            })
        );
        return;
    }

    // Default fetch with cache fallback
    event.respondWith(
        fetch(event.request)
            .then(response => {
                if (response && response.status === 200) {
                    const copy = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                }
                return response;
            })
            .catch(() => caches.match(event.request))
    );
});

// Real Web Push message received from server
self.addEventListener('push', event => {
    let payload = {};
    if (event.data) {
        try {
            payload = event.data.json();
        } catch (e) {
            // Plain-text fallback
            payload = { title: 'Deadline Buddy', body: event.data.text() || 'You have a reminder.' };
        }
    }

    const title = payload.title || 'Deadline Buddy Alert';
    const notifData = payload.data || {};

    // Ensure url is always present in data so notificationclick can navigate
    if (!notifData.url) {
        notifData.url = payload.url || 'reminders.html';
    }
    if (!notifData.reminderId && payload.reminderId) {
        notifData.reminderId = payload.reminderId;
    }

    const options = {
        body: payload.body || 'You have an upcoming deadline or study reminder.',
        icon: payload.icon || './images/icon-192.png',
        badge: payload.badge || './images/icon-192.png',
        tag: payload.tag || ('deadline-buddy-' + Date.now()),
        renotify: true,
        vibrate: [200, 100, 200],
        data: notifData,
        actions: payload.actions || [
            { action: 'open', title: '📖 Open' },
            { action: 'snooze_15', title: '⏱ Snooze 15m' }
        ]
    };

    event.waitUntil(
        self.registration.showNotification(title, options)
    );
});

// Notification click navigation & deep linking
self.addEventListener('notificationclick', event => {
    event.notification.close();

    const data = event.notification.data || {};
    const action = event.action;

    // Handle snooze action directly from system notification button
    if (action === 'snooze_15' && data.reminderId) {
        event.waitUntil(
            fetch('/api/reminders/' + encodeURIComponent(data.reminderId) + '/snooze', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ minutes: 15 })
            }).catch(() => {})
        );
        return;
    }

    // Build the absolute target URL for deep linking
    const targetPath = data.url || 'reminders.html';
    const targetUrl = new URL(targetPath, self.registration.scope).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            // Try to find an existing app window and navigate it
            for (const client of clientList) {
                // Check if this client is from our app scope
                if (client.url.startsWith(self.registration.scope)) {
                    client.focus();
                    if ('navigate' in client) {
                        return client.navigate(targetUrl);
                    }
                    return client;
                }
            }
            // No existing window found — open a new one at the deep link
            return clients.openWindow(targetUrl);
        })
    );
});

// Log when notification is dismissed (for analytics/debug)
self.addEventListener('notificationclose', event => {
    const data = event.notification.data || {};
    console.log('[SW] Notification dismissed, reminderId:', data.reminderId || 'unknown');
});

// Helper for Service Worker to read IndexedDB if needed
function getStoredTasksFromIndexedDB() {
    return new Promise((resolve) => {
        if (typeof indexedDB === 'undefined') return resolve([]);
        const req = indexedDB.open('DeadlineBuddyDB', 1);
        req.onsuccess = (e) => {
            const db = e.target.result;
            if (!db.objectStoreNames.contains('tasks')) return resolve([]);
            try {
                const tx = db.transaction('tasks', 'readonly');
                const store = tx.objectStore('tasks');
                const getAllReq = store.getAll();
                getAllReq.onsuccess = () => resolve(getAllReq.result || []);
                getAllReq.onerror = () => resolve([]);
            } catch (_) {
                resolve([]);
            }
        };
        req.onerror = () => resolve([]);
    });
}

// Background Sync — fires when connectivity is restored (even after app was closed)
self.addEventListener('sync', event => {
    if (event.tag === 'deadline-buddy-offline-sync') {
        event.waitUntil(
            // Notify all open app windows to process their offline queue
            clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
                clientList.forEach(client => {
                    client.postMessage({ type: 'PROCESS_OFFLINE_QUEUE' });
                });
            })
        );
    }
});

// Periodic Background Sync — check deadlines every 30 minutes (Chrome/Android only)
// Falls back to the in-app 30s loop on other browsers
self.addEventListener('periodicsync', event => {
    if (event.tag === 'deadline-buddy-check-reminders') {
        event.waitUntil(checkAndFireDeadlineNotifications());
    }
});

// Message handler — receives messages from app pages
self.addEventListener('message', event => {
    if (!event.data) return;
    if (event.data.type === 'SKIP_WAITING') {
        self.skipWaiting();
    }
    if (event.data.type === 'CHECK_DEADLINES') {
        checkAndFireDeadlineNotifications();
    }
});

/**
 * SW-side deadline check: reads tasks from IndexedDB, fires a system notification
 * for any task that is due in the next 24 h and hasn't been notified yet.
 * This is the background engine that works even when the app is closed on Android.
 */
async function checkAndFireDeadlineNotifications() {
    const tasks = await getStoredTasksFromIndexedDB();
    if (!tasks || !tasks.length) return;

    const now = Date.now();
    const ONE_DAY = 24 * 60 * 60 * 1000;
    const ONE_HOUR = 60 * 60 * 1000;
    const TWENTY_MIN = 20 * 60 * 1000;

    // Track which notifications we have already fired (persist in Cache Storage)
    const firedCache = await caches.open('deadline-buddy-sw-fired');
    const firedRes = await firedCache.match('fired-keys');
    let firedKeys = {};
    if (firedRes) {
        try { firedKeys = await firedRes.json(); } catch (_) {}
    }
    let updated = false;

    for (const task of tasks) {
        if (task.status === 'Completed') continue;
        const dueDateStr = task.dueDate;
        const dueTimeStr = task.dueTime || '23:59';
        if (!dueDateStr) continue;

        let deadline;
        try {
            deadline = dueDateStr.includes('T')
                ? new Date(dueDateStr)
                : new Date(`${dueDateStr}T${dueTimeStr}:00`);
        } catch (_) { continue; }
        if (isNaN(deadline.getTime())) continue;

        const diff = deadline.getTime() - now;
        const title = task.title || 'Deadline';

        const checks = [
            { key: `${task.id}_1day`,   threshold: ONE_DAY,    label: '📅 Due Tomorrow', body: `${title} is due tomorrow at ${dueTimeStr}.` },
            { key: `${task.id}_1hour`,  threshold: ONE_HOUR,   label: '⏰ Due in 1 Hour', body: `${title} is due in about 1 hour!` },
            { key: `${task.id}_20min`,  threshold: TWENTY_MIN, label: '🚨 Due in 20 Min', body: `${title} is due in 20 minutes! Submit now.` },
            { key: `${task.id}_overdue`,threshold: 0,          label: '❌ Deadline Missed', body: `${title} deadline has passed.`, overdue: true }
        ];

        for (const check of checks) {
            if (firedKeys[check.key]) continue;
            const inWindow = check.overdue
                ? (diff < 0 && diff > -ONE_HOUR)   // only fire overdue within 1h after deadline
                : (diff > 0 && diff <= check.threshold);
            if (!inWindow) continue;

            try {
                await self.registration.showNotification(check.label, {
                    body: check.body,
                    icon: './images/icon-192.png',
                    badge: './images/icon-192.png',
                    tag: `deadline-${check.key}`,
                    vibrate: [200, 100, 200],
                    data: { url: 'reminders.html', taskId: task.id }
                });
                firedKeys[check.key] = now;
                updated = true;
            } catch (_) {}
        }
    }

    if (updated) {
        // Prune keys older than 2 days to prevent unbounded growth
        const twoDays = 2 * 24 * 60 * 60 * 1000;
        for (const k of Object.keys(firedKeys)) {
            if (now - firedKeys[k] > twoDays) delete firedKeys[k];
        }
        await firedCache.put('fired-keys', new Response(JSON.stringify(firedKeys), {
            headers: { 'Content-Type': 'application/json' }
        }));
    }
}

