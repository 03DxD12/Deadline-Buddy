/**
 * APP ENGINE - Deadline Buddy (Happy Hues Theme Engine)
 * Shared UI controller, sidebar drawer, notification bell, live ticker loop.
 */

applySavedTheme();

document.addEventListener('DOMContentLoaded', function () {
    applySavedTheme();
    initCommonUI();
    updateLiveTimers();
    setInterval(updateLiveTimers, 30000);
});

function applySavedTheme() {
    let theme = 'pink';
    if (typeof Storage !== 'undefined' && typeof Storage.getTheme === 'function') {
        theme = Storage.getTheme();
    } else {
        theme = localStorage.getItem('deadlinebuddy_theme') === 'blue' ? 'blue' : 'pink';
    }

    document.documentElement.setAttribute('data-theme', theme);
    if (document.body) document.body.setAttribute('data-theme', theme);
}

function initCommonUI() {
    // Top bar info & User display elements
    if (typeof Storage !== 'undefined') {
        const user = Storage.getUser();

        const sidebarName = document.getElementById('sidebarName');
        const sidebarTrack = document.getElementById('sidebarTrack');
        const sidebarAvatar = document.getElementById('sidebarAvatar');

        if (sidebarName) sidebarName.innerText = user.name || 'Student';
        if (sidebarTrack) sidebarTrack.innerText = `${user.gradeLevel || 'Grade 12'} - ${user.strand || 'ASSH'}`;
        if (sidebarAvatar) renderAvatar(sidebarAvatar, user);

        const userNameEls = document.querySelectorAll('.user-name-display');
        userNameEls.forEach(el => el.innerText = user.name || 'Student');

        const userMetaEls = document.querySelectorAll('.user-meta-display');
        userMetaEls.forEach(el => el.innerText = `${user.gradeLevel || 'Grade 12'} - ${user.strand || 'ASSH'}`);

        const avatarEls = document.querySelectorAll('.avatar-display');
        avatarEls.forEach(el => {
            renderAvatar(el, user);
        });
    }

    // Mobile menu drawer toggle logic
    const menuToggleBtn = document.getElementById('menuToggle') || document.getElementById('mobileMenuToggle');
    const sidebar = document.getElementById('sidebar') || document.querySelector('.sidebar');
    
    if (menuToggleBtn && sidebar) {
        menuToggleBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            sidebar.classList.toggle('open');
            document.body.classList.toggle('sidebar-open', sidebar.classList.contains('open'));
        });

        // Close sidebar on document click outside
        document.addEventListener('click', function (e) {
            if (sidebar.classList.contains('open') && !sidebar.contains(e.target) && !menuToggleBtn.contains(e.target)) {
                sidebar.classList.remove('open');
                document.body.classList.remove('sidebar-open');
            }
        });

        document.addEventListener('keydown', function (e) {
            if (e.key === 'Escape' && sidebar.classList.contains('open')) {
                sidebar.classList.remove('open');
                document.body.classList.remove('sidebar-open');
            }
        });
    }

    // Notification Bell Dropdown setup
    setupNotificationBell();
    setupButtonPressEffects();
    setupTooltips();
    setupOfflineStatus();
    setupPwaInstallPrompt();
    showPendingFeedbackToast();

    // Password visibility toggle buttons
    const passToggleBtns = document.querySelectorAll('.password-toggle-btn');
    passToggleBtns.forEach(btn => {
        btn.addEventListener('click', function () {
            const targetId = btn.getAttribute('data-target');
            const input = document.getElementById(targetId);
            if (input) {
                if (input.type === 'password') {
                    input.type = 'text';
                    btn.innerText = 'Hide';
                } else {
                    input.type = 'password';
                    btn.innerText = 'Show';
                }
            }
        });
    });

    // Auto-dismiss alert banners after 5s
    const alerts = document.querySelectorAll('.alert');
    alerts.forEach(alert => {
        setTimeout(() => {
            alert.style.opacity = '0';
            setTimeout(() => alert.style.display = 'none', 400);
        }, 6000);
    });
}

function showPendingFeedbackToast() {
    try {
        const pending = JSON.parse(sessionStorage.getItem('deadlinebuddy_pending_toast'));
        if (!pending) return;
        sessionStorage.removeItem('deadlinebuddy_pending_toast');
        showFeedbackToast(pending.message, pending.type || 'info', pending.title || '');
    } catch (error) {
        sessionStorage.removeItem('deadlinebuddy_pending_toast');
    }
}

function queueFeedbackToast(message, type = 'info', title = '') {
    sessionStorage.setItem('deadlinebuddy_pending_toast', JSON.stringify({ message, type, title }));
}

window.queueFeedbackToast = queueFeedbackToast;

function setupTooltips() {
    const tooltipTargets = document.querySelectorAll('.icon-btn, .mobile-toggle, .password-toggle-btn, [aria-label]');
    tooltipTargets.forEach(target => {
        if (target.dataset.tooltip) return;
        const label = target.getAttribute('aria-label') || target.getAttribute('title');
        if (!label) return;
        target.dataset.tooltip = label;
    });
}

function setupOfflineStatus() {
    let banner = document.getElementById('connectionStatusBanner');
    if (!banner) {
        banner = document.createElement('div');
        banner.id = 'connectionStatusBanner';
        banner.className = 'connection-status-banner hidden';
        banner.setAttribute('role', 'status');
        banner.setAttribute('aria-live', 'polite');
        document.body.appendChild(banner);
    }

    const updateStatus = (showToast = false) => {
        if (navigator.onLine) {
            banner.classList.add('hidden');
            banner.textContent = '';
            if (showToast) showFeedbackToast('You are back online. Deadline Buddy is connected again.', 'success');
            return;
        }

        banner.classList.remove('hidden');
        banner.innerHTML = '<strong>Offline Mode</strong><span>Your saved requirements, calendar, and deadlines are still available.</span>';
        if (showToast) showFeedbackToast('Offline Mode: your saved requirements are still available.', 'info');
    };

    updateStatus(false);
    window.addEventListener('offline', () => updateStatus(true));
    window.addEventListener('online', () => updateStatus(true));
}

function setupPwaInstallPrompt() {
    const DISMISSED_KEY = 'deadlinebuddy_install_prompt_dismissed';
    let deferredPrompt = null;

    window.addEventListener('beforeinstallprompt', event => {
        if (localStorage.getItem(DISMISSED_KEY) === 'true') return;
        event.preventDefault();
        deferredPrompt = event;
        renderInstallPrompt();
    });

    function renderInstallPrompt() {
        if (document.getElementById('pwaInstallPrompt')) return;

        const prompt = document.createElement('div');
        prompt.id = 'pwaInstallPrompt';
        prompt.className = 'pwa-install-prompt';
        prompt.innerHTML = `
            <div>
                <strong>Install Deadline Buddy</strong>
                <span>Open it like an app from your desktop or home screen.</span>
            </div>
            <div class="pwa-install-actions">
                <button class="btn btn-primary" type="button" id="pwaInstallBtn">Install</button>
                <button class="btn btn-secondary" type="button" id="pwaDismissBtn" aria-label="Dismiss install prompt">Later</button>
            </div>
        `;
        document.body.appendChild(prompt);

        document.getElementById('pwaInstallBtn').addEventListener('click', async () => {
            if (!deferredPrompt) return;
            deferredPrompt.prompt();
            await deferredPrompt.userChoice;
            deferredPrompt = null;
            prompt.remove();
            showFeedbackToast('Deadline Buddy install prompt completed.', 'success');
        });

        document.getElementById('pwaDismissBtn').addEventListener('click', () => {
            localStorage.setItem(DISMISSED_KEY, 'true');
            prompt.remove();
        });
    }
}

function showFeedbackToast(message, type = 'info', title = '') {
    let container = document.getElementById('feedbackToastContainer');
    if (!container) {
        container = document.createElement('div');
        container.id = 'feedbackToastContainer';
        container.className = 'feedback-toast-container';
        container.setAttribute('aria-live', 'polite');
        document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `feedback-toast toast-${type}`;
    toast.setAttribute('role', type === 'error' ? 'alert' : 'status');
    toast.innerHTML = `
        <div class="feedback-toast-content">
            ${title ? `<strong>${escapeHtml(title)}</strong>` : ''}
            <span>${escapeHtml(message)}</span>
        </div>
        <button type="button" aria-label="Dismiss message">x</button>
    `;

    const dismiss = () => {
        toast.classList.add('leaving');
        setTimeout(() => toast.remove(), 180);
    };

    toast.querySelector('button').addEventListener('click', dismiss);
    container.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('show'));
    setTimeout(dismiss, type === 'error' ? 7000 : 4200);
}

window.showFeedbackToast = showFeedbackToast;

function setupButtonPressEffects() {
    const pressTargets = document.querySelectorAll('.btn, .icon-btn, .mobile-toggle, .nav-item, .mobile-nav-item');

    pressTargets.forEach(target => {
        target.addEventListener('pointerdown', function (e) {
            const rect = target.getBoundingClientRect();
            const x = ((e.clientX - rect.left) / rect.width) * 100;
            const y = ((e.clientY - rect.top) / rect.height) * 100;
            target.style.setProperty('--press-x', `${x}%`);
            target.style.setProperty('--press-y', `${y}%`);
            target.classList.add('is-pressing');
        });

        ['pointerup', 'pointercancel', 'pointerleave', 'blur'].forEach(eventName => {
            target.addEventListener(eventName, function () {
                window.setTimeout(() => target.classList.remove('is-pressing'), 120);
            });
        });
    });
}

function renderAvatar(el, user) {
    if (!el) return;
    if (user && user.avatarDataUrl) {
        el.classList.add('has-image');
        el.innerHTML = `<img src="${user.avatarDataUrl}" alt="${escapeHtml(user.name || 'Student')} profile picture">`;
    } else {
        el.classList.remove('has-image');
        el.textContent = (user && user.name ? user.name : 'G12').charAt(0).toUpperCase();
    }
}

function setupNotificationBell() {
    const notifBtn = document.getElementById('notifBtn') || document.getElementById('notifBellBtn');
    const notifDropdown = document.getElementById('notifDropdown');
    const clearBtn = document.getElementById('clearNotifsBtn');

    if (notifBtn && notifDropdown) {
        notifBtn.addEventListener('click', function (e) {
            e.stopPropagation();
            notifDropdown.classList.toggle('hidden');
            notifDropdown.classList.toggle('show');
        });

        document.addEventListener('click', function (e) {
            if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
                notifDropdown.classList.add('hidden');
                notifDropdown.classList.remove('show');
            }
        });
    }

    if (clearBtn) {
        clearBtn.addEventListener('click', function () {
            if (typeof clearNotifications === 'function') clearNotifications();
            renderNotificationWidget();
        });
    }

    renderNotificationWidget();
}

function renderNotificationWidget() {
    if (typeof Storage !== 'undefined' && typeof getNotifications !== 'undefined') {
        // Use raw function directly for freshness
    }

    const notifs  = getNotifications();
    const unread  = notifs.filter(n => !n.isRead).length;
    const list    = document.getElementById('notifList');
    const badge   = document.getElementById('notifBadge') || document.getElementById('notifBadgeCount');

    // Badge: show count when there are unread alerts
    if (badge) {
        if (unread > 0) {
            badge.classList.remove('hidden');
            badge.textContent = unread > 9 ? '9+' : String(unread);
        } else {
            badge.classList.add('hidden');
            badge.textContent = '';
        }
    }

    if (!list) return;

    if (notifs.length === 0) {
        list.innerHTML = '<div style="padding:16px;text-align:center;color:var(--text-muted);font-size:0.85rem;">No active alerts</div>';
        return;
    }

    // Color map matching notifications.js types
    const typeColors = {
        OVERDUE:    { dot: '#B51D54', bg: '#FFE5EC' },
        DUE_20_MIN: { dot: '#7A4D00', bg: '#FFF0C2' },
        DUE_1_DAY:  { dot: '#00664F', bg: '#E5FFF3' }
    };

    list.innerHTML = notifs.slice(0, 10).map(n => {
        const c   = typeColors[n.type] || { dot: '#64748B', bg: '#F8FAFC' };
        const ts  = n.timestamp || n.createdAt;
        const time = ts ? new Date(ts).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '';
        return `
            <div class="notif-item" style="background:${c.bg};border-left:3px solid ${c.dot};border-radius:0;">
                <div style="font-weight:700;color:var(--text-heading);font-size:0.82rem;">${escapeHtml(n.title || 'Deadline Alert')}</div>
                <div style="color:var(--text-body);font-size:0.78rem;margin-top:2px;">${escapeHtml(n.message)}</div>
                ${time ? `<div style="font-size:0.7rem;color:var(--text-muted);margin-top:3px;">${time}</div>` : ''}
            </div>
        `;
    }).join('');
}

function updateLiveTimers() {
    if (typeof Deadline === 'undefined') return;

    const timerElements = document.querySelectorAll('[data-due-date], [data-due-iso], [data-countdown-date]');
    timerElements.forEach(function (el) {
        const isoStr = el.getAttribute('data-due-date') || el.getAttribute('data-due-iso') || el.getAttribute('data-countdown-date');
        if (!isoStr) return;

        const urgency = Deadline.getUrgencyState(isoStr);

        if (el.hasAttribute('data-countdown-date')) {
            el.textContent = Deadline.getTimeRemainingText({ dueDate: isoStr, status: el.dataset.status || 'Pending' });
        } else if (el.classList.contains('badge') || el.classList.contains('timer-badge')) {
            el.className = `badge ${urgency.badgeClass}`;
            el.textContent = urgency.label;
        } else if (el.tagName === 'SPAN' || el.tagName === 'DIV') {
            el.textContent = urgency.label;
        }
    });

    // Check notifications periodically via engine
    if (typeof NotificationsEngine !== 'undefined') {
        NotificationsEngine.checkDeadlinesAndNotify();
    }
}

function escapeHtml(value) {
    return String(value || '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}
