/**
 * PWA OFFLINE SHELL - Deadline Buddy
 * Registers the service worker for installability and offline loading.
 * This file does not use server-sent push reminders. Offline closed-app reminders are handled
 * by packaged device versions such as Electron on Windows.
 */

(function registerOfflineShell() {
    if (!('serviceWorker' in navigator)) return;

    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (refreshing) return;
        refreshing = true;
        window.location.reload();
    });

    window.addEventListener('load', () => {
        if (window.location.protocol === 'file:') {
            console.info('Deadline Buddy PWA cache is available when opened from localhost or HTTPS.');
            return;
        }

        navigator.serviceWorker
            .register('./service-worker.js')
            .then(registration => registration.update())
            .catch(error => console.warn('Deadline Buddy service worker setup failed:', error));
    });
})();
