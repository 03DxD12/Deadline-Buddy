const CACHE_NAME = 'deadline-buddy-shell-v1';
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
    './js/app.js',
    './js/deadline.js',
    './js/notifications.js',
    './js/pwa.js',
    './js/storage.js',
    './images/deadline-buddy-logo.svg',
    './manifest.json'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)).then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(keys => Promise.all(keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => cached || fetch(event.request).then(response => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            return response;
        }).catch(() => {
            if (event.request.mode === 'navigate') return caches.match('./index.html');
            return cached;
        }))
    );
});

self.addEventListener('push', event => {
    let data = {};
    try {
        data = event.data ? event.data.json() : {};
    } catch (error) {
        data = { title: 'Deadline Buddy', body: event.data ? event.data.text() : 'You have a deadline reminder.' };
    }

    const title = data.title || 'Deadline Buddy';
    const options = {
        body: data.body || 'You have a deadline reminder.',
        icon: './images/deadline-buddy-logo.svg',
        badge: './images/deadline-buddy-logo.svg',
        tag: data.tag || `deadline-${Date.now()}`,
        renotify: true,
        requireInteraction: true,
        data: {
            url: data.url || './reminders.html',
            taskId: data.taskId || null
        },
        actions: [
            { action: 'open', title: 'Open Deadline Buddy' }
        ]
    };

    event.waitUntil(self.registration.showNotification(title, options));
});

self.addEventListener('notificationclick', event => {
    event.notification.close();
    const targetUrl = new URL(event.notification.data && event.notification.data.url ? event.notification.data.url : './reminders.html', self.location.origin).href;

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true }).then(clientList => {
            for (const client of clientList) {
                if ('focus' in client) {
                    client.focus();
                    if ('navigate' in client) return client.navigate(targetUrl);
                    return client;
                }
            }
            return clients.openWindow(targetUrl);
        })
    );
});
