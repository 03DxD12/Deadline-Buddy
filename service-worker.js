const CACHE_NAME = 'deadline-buddy-shell-v14';
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
    './js/pwa.js',
    './js/device-reminders.js',
    './js/storage.js',
    './images/deadline-buddy-logo.svg',
    './images/subject-books.svg',
    './webfonts/fa-brands-400.woff2',
    './webfonts/fa-regular-400.woff2',
    './webfonts/fa-solid-900.woff2',
    './webfonts/fa-v4compatibility.woff2',
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

    if (event.request.mode === 'navigate') {
        event.respondWith(
            fetch(event.request).then(response => {
                const copy = response.clone();
                caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
                return response;
            }).catch(() => caches.match(event.request).then(cached => cached || caches.match('./index.html')))
        );
        return;
    }

    event.respondWith(
        fetch(event.request).then(response => {
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
            return response;
        }).catch(() => caches.match(event.request))
    );
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
