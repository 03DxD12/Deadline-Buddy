# Deadline Buddy System Architecture, Code Guide, and PWA + Android App Documentation

This guide provides a comprehensive technical explanation of the **Deadline Buddy** dual architecture:
1. **Progressive Web App (PWA)**: Browser installable web application with Service Worker offline caching.
2. **Installed Capacitor Android Mobile App**: Native device application with operating system scheduled alarms (`@capacitor/local-notifications`) delivering exact reminders when the app is completely closed, removed from recent apps, asleep, and offline.

---

## 1. System Overview

**Deadline Buddy** is an offline-first student academic planner and deadline management system designed for Senior High School (Grade 11 and Grade 12) students.

It provides:
- Academic requirement tracking (assignments, projects, quizzes, exams, research papers)
- Intelligent deadline urgency calculations (Due Today, Due Soon, Upcoming, Urgent, Overdue)
- Subtask step-by-step checklists with progress visualization
- Subject management with class schedules powering dynamic "Today's Classes"
- Visual academic calendar with day-by-day deadline inspections
- Integrated Reminders & Study Session Center
- In-app Notification Center with persistent read/unread history
- Cross-platform installability via standard browser PWA capabilities
- **Android Native Alarms**: Exact offline notifications scheduled directly with Android's `AlarmManager` via Capacitor. Reminders trigger even when the app is closed, asleep, and offline with zero background JavaScript loop overhead.

---

## 2. Project Structure

```text
Deadline-Buddy/
├── android/                    # Capacitor Native Android Studio Project
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml # Permissions (POST_NOTIFICATIONS, SCHEDULE_EXACT_ALARM, RECEIVE_BOOT_COMPLETED)
│   │   └── assets/public/      # Bundled web application assets
│   └── ...
├── css/
│   ├── style.css               # Core styling, responsive layouts, color themes (Pink & Clean Blue)
│   └── fontawesome.min.css     # Local Font Awesome icon stylesheet
├── images/
│   ├── deadline-buddy-logo.svg # Mascot logo
│   ├── icon-192.png            # PWA manifest standard icon
│   ├── icon-512.png            # PWA manifest high-res splash icon
│   └── subject-books.svg       # Dashboard banner graphics
├── js/
│   ├── app.js                  # Global UI controllers, navigation, theme toggling, and helpers
│   ├── storage.js              # LocalStorage & IndexedDB dual-layer persistent storage engine
│   ├── deadline.js             # Deadline threshold calculation engine
│   ├── notifications.js        # In-app toast alerts, notification bell badges, and history
│   ├── local-notifications.js  # Android native alarms & Capacitor Local Notifications controller
│   ├── push.js                 # Web Push subscription, VAPID handshakes, and server sync
│   └── pwa.js                  # Service Worker registration, install prompts, and standalone detection
├── webfonts/
├── www/                        # Build folder synced to Capacitor Android assets
├── index.html                  # Login, registration, and PWA install prompt
├── dashboard.html              # Academic summary, Today's Classes, Today's Deadlines, urgent tasks
├── subjects.html               # Subject and class schedule manager
├── tasks.html                  # Comprehensive requirements table with filters and search
├── task-form.html              # Add/edit requirement form with deadline reminder checkboxes
├── task-details.html           # Detailed requirement view with checklist, countdown, and snooze
├── calendar.html               # Interactive monthly academic deadline calendar
├── reminders.html              # Reminders Hub, Study Sessions, Notification Center, and Native Alarm Status
├── profile.html                # Student profile, theme picker, data backup/restore, precise alarms, & PWA status
├── manifest.json               # Web App Manifest for PWA installation
├── service-worker.js           # Offline application cache, push handler, and deep-link click events
├── capacitor.config.ts         # Capacitor project configuration
├── package.json                # Dependencies (@capacitor/core, @capacitor/local-notifications)
├── README.md                   # Project overview and user guide
└── CLIENT-DEMO-GUIDE.md        # Step-by-step presentation script
```

---

## 3. Technology Stack

- **Frontend:** Semantic HTML5, CSS3 with CSS Custom Properties (Theme tokens), Vanilla ES6+ JavaScript.
- **PWA Shell:** W3C Web App Manifest (`manifest.json`) and Service Worker (`service-worker.js`).
- **Data Layer:** IndexedDB (`DeadlineBuddyDB`) + LocalStorage fallback.
- **Push & Background Alerts:** Web Push API (`PushManager`), Notifications API (`showNotification`), and VAPID protocol.
- **No Heavy Build Tooling:** Zero Node.js runtime dependency for deployment; hostable as static files on GitHub Pages, Netlify, Vercel, or local web servers.

---

## 4. Data Architecture & IndexedDB Integration

To guarantee that both web pages and background Service Workers can access stored academic information, Deadline Buddy implements a dual-layer storage model:

```text
User Action / UI Form
         │
         ▼
    js/storage.js
    ┌────┴───────────────────────────┐
    ▼                                ▼
LocalStorage                     IndexedDB (DeadlineBuddyDB)
(Instant synchronous UI read)    (Structured data accessible by Service Worker)
                                 ├── tasks
                                 ├── subjects
                                 ├── user
                                 ├── notifications
                                 └── settings
```

### IndexedDB Object Stores
1. `tasks`: All academic requirements, subtasks, due dates, and completion timestamps.
2. `subjects`: Subject names, instructor names, and class schedules.
3. `user`: Profile details, grade level, strand, and custom avatar data.
4. `notifications`: In-app notification center logs and read statuses.
5. `settings`: Notification toggles and quiet hour configurations.

---

## 5. Background Reminders & Notification Architecture

### Reminder Stages
Every academic requirement supports multi-stage notifications:
1. **1 Day Before** (24 hours prior)
2. **1 Hour Before** (60 minutes prior)
3. **20 Minutes Before** (urgent focus)
4. **When Overdue** (immediate overdue alert)

### Push Notification Delivery Flow
```text
Student creates/edits task
        ↓
Saved to IndexedDB & LocalStorage
        ↓
Notification schedule registered with Push Service
        ↓
Student closes Deadline Buddy PWA
        ↓
Scheduled reminder time arrives
        ↓
Web Push message dispatched to browser push service
        ↓
Browser wakes service-worker.js
        ↓
Service Worker displays persistent notification (self.registration.showNotification)
        ↓
Student clicks notification
        ↓
PWA opens directly to the exact requirement
```

---

## 6. Offline Capabilities & Technical Truthfulness

| State | Capabilities |
| :--- | :--- |
| **PWA Open + Offline** | Cached HTML, CSS, JavaScript, icons, and webfonts load instantly. Students can view and edit records in IndexedDB/LocalStorage. In-app reminder alerts trigger while the app is active. |
| **PWA Closed + Online** | Web Push service delivers push events to `service-worker.js`. System displays persistent OS notifications even though the PWA is closed. |
| **PWA Closed + Completely Offline** | Browsers do not run continuous local background daemons for web apps. Therefore, exact offline alarm delivery while the app is closed cannot be guaranteed without network connectivity. As soon as the device reconnects or the student opens the app, all records are immediately verified and displayed. |

---

## 7. Installation & PWA Deployment

1. **Deploy to any HTTPS Host** (e.g. GitHub Pages, Netlify, Vercel):
   - Upload the project files to your static hosting provider.
2. **Mobile Installation:**
   - **Android (Chrome/Edge):** Open URL &rarr; Tap "Install App" or "Add to Home screen".
   - **iOS (Safari):** Open URL &rarr; Tap Share icon &rarr; Tap "Add to Home Screen".
3. **Desktop Installation:**
   - **Chrome / Edge:** Click the install icon in the address bar or click "Install App" on `profile.html`.
4. **Standalone Mode:**
   - The app launches with a native splash screen, no URL bar, full screen real-estate, and dedicated home-screen icon.
