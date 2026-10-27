/**
 * PWA OFFLINE SHELL & LIFECYCLE - Deadline Buddy
 * Controls PWA installation, Service Worker registration,
 * offline caching detection, and standalone state.
 */

(function initPwaLifecycle() {
    let deferredPrompt = null;
    let isRefreshing = false;

    // Detect installation prompt availability
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        window.isPwaInstallable = true;
        document.dispatchEvent(new CustomEvent('pwa-installable'));
        const installBtns = document.querySelectorAll('#installAppBtn, #profileInstallAppBtn, .pwa-install-trigger');
        installBtns.forEach(btn => {
            btn.style.display = 'inline-flex';
        });
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        window.isPwaInstalled = true;
        document.dispatchEvent(new CustomEvent('pwa-installed'));
        if (typeof showFeedbackToast === 'function') {
            showFeedbackToast('Deadline Buddy installed successfully!', 'success', 'PWA Ready');
        }
    });

    // Expose global install trigger function
    window.installDeadlineBuddyPwa = async function() {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                deferredPrompt = null;
            }
            return outcome;
        } else if (window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true) {
            if (typeof showFeedbackToast === 'function') {
                showFeedbackToast('Deadline Buddy is already installed and running as a standalone app.', 'info');
            } else {
                alert('Deadline Buddy is already installed on this device.');
            }
            return 'already-installed';
        } else {
            // Provide guidance for iOS Safari or browsers without automated prompt
            const isIOS = /iphone|ipad|ipod/i.test(navigator.userAgent);
            if (isIOS) {
                alert('To install Deadline Buddy on iOS:\n1. Tap the Share icon (square with arrow up)\n2. Scroll down and tap "Add to Home Screen"\n3. Tap "Add"');
            } else {
                alert('To install Deadline Buddy:\nOpen your browser menu (three dots) and tap "Install app" or "Add to Home Screen".');
            }
            return 'manual-instructions';
        }
    };

    // Check if running as installed standalone app
    window.isPwaStandalone = function() {
        return window.matchMedia('(display-mode: standalone)').matches ||
               window.navigator.standalone === true ||
               document.referrer.includes('android-app://');
    };

    if (!('serviceWorker' in navigator)) return;

    navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (isRefreshing) return;
        isRefreshing = true;
        const activeInput = document.activeElement;
        const isEditing = activeInput && (activeInput.tagName === 'INPUT' || activeInput.tagName === 'TEXTAREA');
        if (!isEditing) {
            window.location.reload();
        }
    });

    window.addEventListener('load', () => {
        if (window.location.protocol === 'file:') {
            console.info('Deadline Buddy PWA cache is active when opened from localhost, HTTPS, or Live Server.');
            return;
        }

        navigator.serviceWorker
            .register('./service-worker.js')
            .then(reg => {
                // Check for updates periodically
                setInterval(() => {
                    reg.update().catch(() => {});
                }, 60 * 60 * 1000);

                reg.addEventListener('updatefound', () => {
                    const newWorker = reg.installing;
                    if (!newWorker) return;
                    newWorker.addEventListener('statechange', () => {
                        if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                            if (typeof showFeedbackToast === 'function') {
                                showFeedbackToast('A new version of Deadline Buddy is available. Restart to update.', 'info', 'App Update');
                            }
                        }
                    });
                });
            })
            .catch(error => {
                console.warn('Deadline Buddy Service Worker registration note:', error);
            });
    });
})();
