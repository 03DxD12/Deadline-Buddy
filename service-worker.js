const CACHE_NAME = 'deadline-buddy-shell-v20';
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

// Pre-cache core application shell
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(APP_SHELL))
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

    // Dynamic REST APIs must never be cached by service worker
    if (url.pathname.startsWith('/api/')) {
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

