# Deadline Buddy (PWA + Installable Mobile App)

**Deadline Buddy** is an offline-first academic planner and deadline management system designed for Grade 11 and Grade 12 students. It organizes subjects, class schedules, requirements, checklists, calendar views, and multi-stage deadline reminders.

Deadline Buddy provides two ways of using the system:

```text
                  DEADLINE BUDDY
                         │
              ┌──────────┴──────────┐
              │                     │
              ▼                     ▼
          Web / PWA          Installed Android App
              │                     │
              ▼                     ▼
       Service Worker           Capacitor
              │                     │
       Offline caching              ▼
                              Local Notifications
                                    │
                                    ▼
                              Android Alarm
                                    │
                                    ▼
                             System Notification
```

---

## 1. Two Operational Modes

### 1. Website / PWA
- **Accessible via any modern browser** (Chrome, Edge, Safari, Firefox).
- **Offline caching** via Service Worker (`service-worker.js`).
- **Can be added to home screen** as an installable Progressive Web App.
- **Local records** stored in localStorage and IndexedDB.
- **Background notifications** when closed rely on standard Web Push.

### 2. Installed Deadline Buddy Android App (Capacitor)
- Packaged as a native Android application using **Capacitor** (`@capacitor/android`) and **Capacitor Local Notifications** (`@capacitor/local-notifications`).
- **Closed-App Reminders:** Reminders are scheduled directly with Android's `AlarmManager`.
- **Works when the app is completely closed** and removed from the recent apps screen.
- **Works while the device is sleeping / screen locked.**
- **Offline Scheduled Alarms:** Requires **NO internet connection** after the reminders have been scheduled.
- **No continuous battery-draining JavaScript loops** (`while(appIsRunning)`) - the phone's operating system manages the scheduled alarms.
- **Exact Reminder Scheduling:** Uses `SCHEDULE_EXACT_ALARM` / `USE_EXACT_ALARM` permissions where allowed by Android.

---

## 2. Multi-Stage Deadline Reminder Flow

When a student creates or edits a requirement (e.g., *Research Chapter 2* due *Nov 10, 11:59 PM*), Deadline Buddy immediately calculates up to 4 reminder times:

| Reminder Stage | Target Time | Description | Unique Notification ID Formula |
|---|---|---|---|
| **Reminder 1** | Deadline − 24 hours | Due in 1 day | `taskId * 10 + 1` (e.g. `10501`) |
| **Reminder 2** | Deadline − 1 hour | Due in 1 hour | `taskId * 10 + 2` (e.g. `10502`) |
| **Reminder 3** | Deadline − 20 minutes | Due in 20 minutes | `taskId * 10 + 3` (e.g. `10503`) |
| **Reminder 4** | Deadline + 1 minute | Deadline has passed (Overdue) | `taskId * 10 + 4` (e.g. `10504`) |

### Key Scheduling Rules
- **Future-Only Filtering:** Only reminder intervals that are still in the future are scheduled. If a requirement is created with less than 1 hour remaining, past intervals are skipped, and immediate advance notice is provided.
- **Editing a Deadline:** When a student changes the due date or time, previous scheduled alarms are automatically canceled and new alarms are recalculated and scheduled.
- **Mark as Done:** When a task is marked `Completed`, all pending alarms are instantly canceled to avoid annoying the student.
- **Deleting a Task:** Deleting a task immediately removes all associated scheduled device notifications.
- **Device Reboot Handling:** Reschedules all active uncompleted deadlines upon app launch or device reboot so alarms persist.

---

## 3. Clean Project Structure

```text
Deadline-Buddy/
├── docs/                      # Project Documentation, Client Guides, and Defense Reports
│   ├── CLIENT-DEMO-GUIDE.md
│   ├── DEADLINE-BUDDY-CLIENT-EXPLANATION-AND-SYSTEM-GUIDE.md
│   ├── DEADLINE-BUDDY-DESIGN-INNOVATION-PROJECT-REPORT.md
│   ├── READ ME FIRST.txt
│   ├── StudySpace-Design-Innovation-Project-Report.md
│   └── SYSTEM-EXPLANATION-AND-DEMO-GUIDE.md
├── android/                   # Native Android Project (Capacitor)
│   ├── app/src/main/
│   │   ├── AndroidManifest.xml # Notification & Exact Alarm Permissions
│   │   └── assets/public/     # Packaged Web Assets
│   └── ...
├── css/
│   ├── style.css              # Main Theme & Mobile Responsive CSS
│   └── fontawesome.min.css    # Icon fonts
├── images/                    # Icons and SVG Brand Assets
├── js/
│   ├── app.js                 # App initialization & navigation
│   ├── storage.js             # Local academic records & persistence hooks
│   ├── deadline.js            # Urgency calculations & date math
│   ├── notifications.js       # In-app toasts & alert popups
│   ├── local-notifications.js # Native Android alarms & exact scheduling
│   ├── push.js                # Web Push diagnostics & manager
│   └── pwa.js                 # Service worker registration & install prompts
├── server/                    # Node.js Express REST API & Web Push Server
│   ├── index.js               # API Server entry point
│   ├── db.js                  # Persistent JSON storage handler
│   ├── scheduler.js           # 15s background interval push worker
│   └── package.json           # Server dependencies
├── data/                      # Server data storage & VAPID keys
├── www/                       # Capacitor build output distribution folder
├── index.html                 # Login, Sign Up, & Install Landing
├── dashboard.html             # Today's Classes, Today's Deadlines, & Overview
├── subjects.html              # Academic subjects & schedules
├── tasks.html                 # Requirements board & filters
├── task-form.html             # Create/Edit requirements & reminders
├── task-details.html          # Detail checklist & urgency countdown
├── calendar.html              # Monthly deadline calendar
├── reminders.html             # Notification Center & Android Alarm status
├── profile.html               # Profile, Settings, Exact Alarms, & Reset
├── apple-touch-icon.png       # Square 192x192 PNG for iOS/iPadOS Home Screen
├── manifest.json              # PWA Web App Manifest
├── service-worker.js          # PWA Service Worker caching
├── capacitor.config.json      # Capacitor configuration
├── package.json               # Dependencies (@capacitor/core, local-notifications)
└── README.md
```

*(Note: Electron, desktop `.exe` files, and Windows tray dependencies have been completely removed.)*

---

## 4. How to Build & Run the Android App

### Prerequisites
- Node.js (v18+)
- Android Studio with Android SDK (API 33+)

### Commands
```bash
# 1. Install dependencies
npm install

# 2. Sync web assets into Android project
npm run cap:sync

# 3. Open in Android Studio to build APK or run on connected phone
npm run cap:open:android
```

From Android Studio:
1. Connect an Android phone via USB (with USB Debugging enabled) or start an Android Emulator.
2. Click **Run 'app'** (Green Play button).
3. Deadline Buddy will install directly onto the device.
4. Allow **Notifications** and **Alarms & Reminders** when prompted in settings.
5. You can now close the app, lock your phone, or disconnect internet—your deadline reminders will still appear right on time!
