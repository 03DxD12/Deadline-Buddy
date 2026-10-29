/**
 * PWA OFFLINE SHELL & LIFECYCLE - Deadline Buddy
 * Comprehensive Progressive Web App controller for Android, iOS (iPhone/iPad),
 * Desktop, and Standalone modes.
 */

(function initPwaLifecycle() {
    let deferredPrompt = null;
    let isRefreshing = false;
    const DISMISSED_KEY = 'deadlinebuddy_install_prompt_dismissed';

    // Device & Platform Helper
    function getPlatformInfo() {
        const ua = navigator.userAgent || '';
        const isIOS = /iphone|ipad|ipod/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
        const isIPad = /ipad/i.test(ua) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1 && window.innerWidth >= 768);
        const isIPhone = isIOS && !isIPad;
        const isAndroid = /android/i.test(ua);
        const isSafari = isIOS && /Safari/i.test(ua) && !/CriOS/i.test(ua) && !/FxiOS/i.test(ua) && !/EdgiOS/i.test(ua) && !/DuckDuckGo/i.test(ua);
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches ||
                             window.navigator.standalone === true ||
                             document.referrer.includes('android-app://');

        return { isIOS, isIPad, isIPhone, isAndroid, isSafari, isStandalone };
    }

    // Expose standalone check globally
    window.isPwaStandalone = function() {
        return getPlatformInfo().isStandalone;
    };

    // Keep internal links inside standalone iOS PWA window
    if (window.navigator.standalone) {
        document.addEventListener('click', function(e) {
            const link = e.target.closest('a');
            if (link && link.href && link.host === window.location.host && !link.hasAttribute('target') && !link.hasAttribute('download')) {
                e.preventDefault();
                window.location.href = link.href;
            }
        }, false);
    }

    // Web Audio unlock on first user gesture for iOS WebKit
    function unlockAudioOnFirstGesture() {
        const unlock = () => {
            if (typeof window.AudioContext !== 'undefined' || typeof window.webkitAudioContext !== 'undefined') {
                try {
                    const ctx = window._appAudioContext || new (window.AudioContext || window.webkitAudioContext)();
                    window._appAudioContext = ctx;
                    if (ctx.state === 'suspended') {
                        ctx.resume();
                    }
                } catch (e) {}
            }
            document.removeEventListener('touchstart', unlock, true);
            document.removeEventListener('touchend', unlock, true);
            document.removeEventListener('click', unlock, true);
        };
        document.addEventListener('touchstart', unlock, true);
        document.addEventListener('touchend', unlock, true);
        document.addEventListener('click', unlock, true);
    }
    unlockAudioOnFirstGesture();

    // Show install buttons if installable or on iOS browser
    function updateInstallButtonVisibility() {
        const platform = getPlatformInfo();
        const installBtns = document.querySelectorAll('#installAppBtn, #profileInstallAppBtn, .pwa-install-trigger');

        if (platform.isStandalone) {
            installBtns.forEach(btn => {
                if (btn.id !== 'profileInstallAppBtn') {
                    btn.style.display = 'none';
                }
            });
            return;
        }

        // On Android/desktop with prompt OR on iOS/iPadOS browser, make buttons visible and active
        if (deferredPrompt || platform.isIOS) {
            installBtns.forEach(btn => {
                btn.style.display = 'inline-flex';
            });
        }
    }

    // Listen to Android & Desktop beforeinstallprompt
    window.addEventListener('beforeinstallprompt', (e) => {
        e.preventDefault();
        deferredPrompt = e;
        window.isPwaInstallable = true;
        document.dispatchEvent(new CustomEvent('pwa-installable'));
        updateInstallButtonVisibility();

        // Check if banner should be rendered
        const dismissedAt = localStorage.getItem(DISMISSED_KEY);
        if (!dismissedAt || (Date.now() - Number(dismissedAt) > 24 * 60 * 60 * 1000)) {
            renderInstallPromptBanner();
        }
    });

    window.addEventListener('appinstalled', () => {
        deferredPrompt = null;
        window.isPwaInstalled = true;
        document.dispatchEvent(new CustomEvent('pwa-installed'));
        const prompt = document.getElementById('pwaInstallPrompt');
        if (prompt) prompt.remove();
        if (typeof showFeedbackToast === 'function') {
            showFeedbackToast('Deadline Buddy installed successfully! Launch it from your Home Screen.', 'success', 'App Installed');
        }
    });

    // Render non-intrusive bottom banner (both on Android & iOS Safari when not standalone)
    function renderInstallPromptBanner() {
        const platform = getPlatformInfo();
        if (platform.isStandalone) return;
        if (document.getElementById('pwaInstallPrompt')) return;

        const banner = document.createElement('div');
        banner.id = 'pwaInstallPrompt';
        banner.className = 'pwa-install-prompt';
        banner.setAttribute('role', 'region');
        banner.setAttribute('aria-label', 'Install App Prompt');

        const labelText = platform.isIOS ? 'Add to Home Screen' : 'Install App';
        const subText = platform.isIPad
            ? 'Install on your iPad for full-screen study and offline access.'
            : (platform.isIPhone
                ? 'Add to iPhone Home Screen for instant alerts and offline access.'
                : 'Add to your device for fast, offline access and instant alerts.');

        banner.innerHTML = `
            <div style="flex: 1; min-width: 0;">
                <strong style="display: flex; align-items: center; gap: 6px;">
                    <img src="apple-touch-icon.png" alt="" style="width: 22px; height: 22px; border-radius: 6px;">
                    Install Deadline Buddy
                </strong>
                <span>${subText}</span>
            </div>
            <div class="pwa-install-actions" style="display: flex; gap: 8px; align-items: center;">
                <button class="btn btn-primary" type="button" id="pwaBannerInstallBtn" style="padding: 6px 14px; font-size: 0.85rem; white-space: nowrap;">${labelText}</button>
                <button class="btn btn-secondary" type="button" id="pwaBannerDismissBtn" style="padding: 6px 10px; font-size: 0.82rem;" aria-label="Dismiss install prompt">Later</button>
            </div>
        `;

        document.body.appendChild(banner);

        document.getElementById('pwaBannerInstallBtn').addEventListener('click', () => {
            window.installDeadlineBuddyPwa();
        });

        document.getElementById('pwaBannerDismissBtn').addEventListener('click', () => {
            localStorage.setItem(DISMISSED_KEY, Date.now().toString());
            banner.remove();
        });
    }

    // Auto-prompt on iOS Safari after user has explored a bit (if not standalone & not dismissed)
    window.addEventListener('DOMContentLoaded', () => {
        updateInstallButtonVisibility();
        const platform = getPlatformInfo();
        if (platform.isIOS && !platform.isStandalone) {
            const dismissedAt = localStorage.getItem(DISMISSED_KEY);
            if (!dismissedAt || (Date.now() - Number(dismissedAt) > 24 * 60 * 60 * 1000)) {
                setTimeout(renderInstallPromptBanner, 2500);
            }
        }
    });

    // Elegant, interactive platform-aware Installation Modal
    window.showInstallInstructionsModal = function() {
        const existing = document.getElementById('installInstructionsModal');
        if (existing) existing.remove();

        const platform = getPlatformInfo();
        let modalTitle = 'Install Deadline Buddy';
        let stepsHtml = '';
        let tipHtml = '';

        if (platform.isIPad) {
            modalTitle = 'Install on iPad (Safari)';
            stepsHtml = `
                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">1</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-heading); margin-bottom: 2px;">
                                Tap the Share Button in the Top Toolbar
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4;">
                                Look at the <strong>top navigation bar</strong> of Safari (next to the address bar) and tap the <strong>Share</strong> icon:
                                <span style="display: inline-flex; align-items: center; justify-content: center; padding: 2px 6px; background: rgba(0,0,0,0.06); border-radius: 6px; margin-left: 4px; vertical-align: middle;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                        <polyline points="16 6 12 2 8 6"/>
                                        <line x1="12" y1="2" x2="12" y2="15"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">2</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-heading); margin-bottom: 2px;">
                                Select "Add to Home Screen"
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4;">
                                In the dropdown sheet, scroll down and tap <strong>Add to Home Screen</strong>:
                                <span style="display: inline-flex; align-items: center; justify-content: center; padding: 2px 6px; background: rgba(0,0,0,0.06); border-radius: 6px; margin-left: 4px; vertical-align: middle;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="12" y1="8" x2="12" y2="16"/>
                                        <line x1="8" y1="12" x2="16" y2="12"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">3</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-heading); margin-bottom: 2px;">
                                Tap "Add"
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4;">
                                Tap <strong>Add</strong> in the top right corner of the confirmation dialog.
                            </div>
                        </div>
                    </div>
                </div>
            `;
            tipHtml = `
                <div style="margin-top: 14px; padding: 10px 14px; background: rgba(255, 139, 167, 0.1); border-left: 3px solid var(--primary); border-radius: 8px; font-size: 0.82rem; color: var(--text-main);">
                    💡 <strong>iPad Standalone Tip:</strong> Launching from your iPad Home Screen enables full-screen workspace, faster offline loading, and Web Push notifications.
                </div>
            `;
        } else if (platform.isIPhone) {
            modalTitle = 'Install on iPhone (Safari)';
            stepsHtml = `
                <div style="display: flex; flex-direction: column; gap: 14px;">
                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">1</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-heading); margin-bottom: 2px;">
                                Tap the Share Button at the Bottom
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4;">
                                In Safari's <strong>bottom toolbar</strong>, tap the <strong>Share</strong> button:
                                <span style="display: inline-flex; align-items: center; justify-content: center; padding: 2px 6px; background: rgba(0,0,0,0.06); border-radius: 6px; margin-left: 4px; vertical-align: middle;">
                                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                                        <path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/>
                                        <polyline points="16 6 12 2 8 6"/>
                                        <line x1="12" y1="2" x2="12" y2="15"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">2</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-heading); margin-bottom: 2px;">
                                Scroll Down and Tap "Add to Home Screen"
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4;">
                                Scroll through the action sheet and select <strong>Add to Home Screen</strong>:
                                <span style="display: inline-flex; align-items: center; justify-content: center; padding: 2px 6px; background: rgba(0,0,0,0.06); border-radius: 6px; margin-left: 4px; vertical-align: middle;">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="color: var(--primary);">
                                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
                                        <line x1="12" y1="8" x2="12" y2="16"/>
                                        <line x1="8" y1="12" x2="16" y2="12"/>
                                    </svg>
                                </span>
                            </div>
                        </div>
                    </div>

                    <div style="display: flex; align-items: flex-start; gap: 12px;">
                        <div style="width: 28px; height: 28px; border-radius: 50%; background: var(--primary); color: #fff; display: flex; align-items: center; justify-content: center; font-weight: 700; font-size: 0.9rem; flex-shrink: 0;">3</div>
                        <div>
                            <div style="font-weight: 600; font-size: 0.92rem; color: var(--text-heading); margin-bottom: 2px;">
                                Tap "Add" (Top-Right)
                            </div>
                            <div style="font-size: 0.84rem; color: var(--text-muted); line-height: 1.4;">
                                Tap <strong>Add</strong> in the top-right corner. Deadline Buddy will appear on your Home Screen with its app icon!
                            </div>
                        </div>
                    </div>
                </div>
            `;
            tipHtml = `
                <div style="margin-top: 14px; padding: 10px 14px; background: rgba(255, 139, 167, 0.1); border-left: 3px solid var(--primary); border-radius: 8px; font-size: 0.82rem; color: var(--text-main);">
                    💡 <strong>iPhone Standalone Tip:</strong> Opening from your Home Screen runs Deadline Buddy in full standalone mode and unlocks iOS 16.4+ Web Push notification reminders!
                </div>
            `;
        } else if (platform.isAndroid) {
            modalTitle = 'Install on Android (Chrome)';
            stepsHtml = `
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem; line-height: 1.5; color: var(--text-main);">
                    <div>1. Tap the browser menu <strong>(⋮)</strong> in the top right corner of Chrome.</div>
                    <div>2. Select <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>.</div>
                    <div>3. Tap <strong>"Install"</strong> to confirm.</div>
                </div>
            `;
        } else {
            modalTitle = 'Install on Desktop / Laptop';
            stepsHtml = `
                <div style="display: flex; flex-direction: column; gap: 12px; font-size: 0.88rem; line-height: 1.5; color: var(--text-main);">
                    <div>1. Click the <strong>Install App icon</strong> on the right side of the browser address bar.</div>
                    <div>2. Or click the browser menu <strong>(⋮)</strong> &rarr; <strong>"Save and share"</strong> &rarr; <strong>"Install Deadline Buddy"</strong>.</div>
                    <div>3. Click <strong>"Install"</strong> to add it to your desktop and taskbar.</div>
                </div>
            `;
        }

        const modal = document.createElement('div');
        modal.id = 'installInstructionsModal';
        modal.className = 'modal-backdrop';
        modal.style.zIndex = '99999';
        modal.setAttribute('role', 'dialog');
        modal.setAttribute('aria-modal', 'true');
        modal.setAttribute('aria-labelledby', 'installModalTitle');

        modal.innerHTML = `
            <div class="modal-card" style="max-width: 480px; width: calc(100vw - 32px); padding: 24px; border-radius: 20px; box-shadow: 0 24px 48px rgba(0,0,0,0.2);">
                <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 14px;">
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <img src="apple-touch-icon.png" alt="Deadline Buddy Logo" style="width: 36px; height: 36px; border-radius: 10px; box-shadow: 0 4px 10px rgba(0,0,0,0.08);">
                        <h3 id="installModalTitle" style="margin: 0; font-size: 1.15rem; color: var(--text-heading); font-weight: 700;">${modalTitle}</h3>
                    </div>
                    <button type="button" class="icon-btn" id="closeInstallModalBtn" aria-label="Close dialog" style="font-size: 1.1rem; width: 32px; height: 32px;">✕</button>
                </div>
                <p style="font-size: 0.86rem; color: var(--text-muted); margin-bottom: 16px; line-height: 1.45;">
                    Installing Deadline Buddy lets you open it instantly like a native app, use it offline without internet, and receive timely deadline reminders!
                </p>
                <div style="background: rgba(0,0,0,0.03); border: 1px solid var(--border-color); border-radius: 14px; padding: 16px; margin-bottom: 14px;">
                    ${stepsHtml}
                </div>
                ${tipHtml}
                <div style="display: flex; justify-content: flex-end; margin-top: 18px;">
                    <button type="button" class="btn btn-primary" id="gotItInstallBtn" style="padding: 8px 20px;">Got It</button>
                </div>
            </div>
        `;

        document.body.appendChild(modal);

        const closeModal = () => modal.remove();
        document.getElementById('closeInstallModalBtn').addEventListener('click', closeModal);
        document.getElementById('gotItInstallBtn').addEventListener('click', closeModal);
        modal.addEventListener('click', e => {
            if (e.target === modal) closeModal();
        });
        document.addEventListener('keydown', function onEsc(e) {
            if (e.key === 'Escape' && document.getElementById('installInstructionsModal')) {
                closeModal();
                document.removeEventListener('keydown', onEsc);
            }
        });
    };

    // Global Install Trigger Function
    window.installDeadlineBuddyPwa = async function() {
        const platform = getPlatformInfo();

        if (platform.isStandalone) {
            if (typeof showFeedbackToast === 'function') {
                showFeedbackToast('Deadline Buddy is already installed and running as a standalone app.', 'info');
            } else {
                alert('Deadline Buddy is already installed on this device.');
            }
            return 'already-installed';
        }

        if (deferredPrompt) {
            try {
                deferredPrompt.prompt();
                const { outcome } = await deferredPrompt.userChoice;
                if (outcome === 'accepted') {
                    deferredPrompt = null;
                    const banner = document.getElementById('pwaInstallPrompt');
                    if (banner) banner.remove();
                    if (typeof showFeedbackToast === 'function') {
                        showFeedbackToast('Installing Deadline Buddy...', 'success');
                    }
                }
                return outcome;
            } catch (err) {
                console.warn('[PWA] Prompt trigger error:', err);
                window.showInstallInstructionsModal();
                return 'manual-instructions';
            }
        }

        // On iOS or browsers without automated beforeinstallprompt
        window.showInstallInstructionsModal();
        return 'manual-instructions';
    };

    // Service Worker Lifecycle & Updates
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
