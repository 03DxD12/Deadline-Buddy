# Deadline Buddy Client Explanation and System Guide

---

## 1. What is Deadline Buddy?

### English Explanation
**Deadline Buddy** is an offline-first student academic planner and deadline management system designed specifically for **Grade 11 and Grade 12 students**.

It helps students organize their:
- Subjects
- Class schedules
- School requirements
- Due dates and due times
- Checklist steps
- Today's Classes
- Today's Deadlines
- Deadline reminders
- Calendar
- Profile information
- Saved records

The main goal of Deadline Buddy is to help students avoid forgetting school requirements and missing important deadlines.

It helps students quickly answer questions such as:
- *What do I need to finish?*
- *What classes do I have today?*
- *What is due today?*
- *What is almost due?*
- *What should I prioritize first?*
- *What is already overdue?*
- *What subject does this requirement belong to?*
- *What smaller checklist steps do I still need to complete?*

The current system already includes **Today's Classes** and **Today's Deadlines** together with subjects, requirements, calendar, reminders, and other student-planning features.

---

## 2. Simpleng Tagalog / Taglish Explanation

Ang **Deadline Buddy** ay isang offline-first academic planner at deadline management system para sa Grade 11 at Grade 12 students.

Parang personal school planner ito ng student. Dito puwedeng i-save at i-manage ang:
- Subjects
- Class schedules
- School requirements
- Due date at due time
- Checklist
- Today's Classes
- Today's Deadlines
- Reminders
- Calendar
- Profile
- Saved records

Tinutulungan nito ang student malaman:
- *Ano pa ang kailangan kong tapusin?*
- *Ano ang classes ko today?*
- *Ano ang due today?*
- *Ano ang malapit na ang deadline?*
- *Ano ang kailangan kong unahin?*
- *Ano ang overdue na?*
- *Saang subject kabilang ang requirement?*
- *Ano pa ang checklist steps na hindi ko tapos?*

Hindi na kailangang tandaan lahat manually dahil ang Deadline Buddy ang tumutulong mag-organize at mag-check ng deadlines.

---

## 3. Clean Installable Progressive Web App (PWA) Architecture

Deadline Buddy is built as an installable **Progressive Web App (PWA)**:

```
┌────────────────────────────────────────────────────────────────────────┐
│                        DEADLINE BUDDY PWA ARCHITECTURE                 │
├───────────────────────────────────┬────────────────────────────────────┤
│     A. Installable PWA Frontend   │    B. Service Worker & Web Push    │
├───────────────────────────────────┼────────────────────────────────────┤
│ • Uses HTML, CSS, JavaScript      │ • Event-driven Service Worker      │
│ • Runs in any modern web browser  │ • Web Push notifications           │
│ • Installable on phone or laptop  │ • IndexedDB structured storage     │
│ • Full-screen standalone mode     │ • Background notifications when    │
│ • Offline caching for all pages   │   the PWA is closed (online)       │
└───────────────────────────────────┴────────────────────────────────────┘
```

### Installable Progressive Web App (PWA)
The application uses:
- Semantic HTML5 & responsive CSS
- Modern JavaScript (ES6+)
- `IndexedDB` & `localStorage`
- Service Worker (`service-worker.js`)
- Web App Manifest (`manifest.json`)
- Web Push API (`PushManager`)

It can:
- Run in any browser (Chrome, Edge, Safari, Brave, Firefox)
- Install directly to your smartphone home screen or laptop desktop without an app store or `.exe`
- Save student records locally in IndexedDB & Local Storage
- Display Today's Classes & Today's Deadlines
- Manage subjects and academic requirements
- Show live countdown timers and step-by-step checklists
- Show the interactive monthly calendar
- Work offline after files have been cached
- Deliver persistent notifications when closed via modern Web Push technology

> [!NOTE]
> **Offline vs Background Delivery:**
> - When the PWA is **open**: works completely offline using locally cached files and IndexedDB records.
> - When the PWA is **closed**: background reminders are delivered via Web Push notifications to the Service Worker.


---

## 4. How the Website Demo is Opened

For a simple website demo:
```
Deadline Buddy Folder → index.html → Browser Opens → Deadline Buddy
```

The website demo version does **NOT** require:
- ❌ No XAMPP
- ❌ No MySQL
- ❌ No PHP
- ❌ No Firebase
- ❌ No Online database
- ❌ No Backend server setup

For proper PWA and Service Worker testing, it is best accessed via:
- VS Code Live Server (`http://127.0.0.1:5500`)
- GitHub Pages / Vercel / Netlify
- Or any local web server.

---

## 5. Where the Records are Saved

Deadline Buddy saves all records in **`localStorage`** on the client's device:
- Student Accounts & Login sessions
- Student Profile & Profile Picture
- Subjects & Schedules
- Requirements & Notes
- Checklist Steps
- Notification history & logs
- Theme preferences (Pink / Blue mode)
- Device reminder preferences

> [!TIP]
> Records stay securely on the **same browser + same device** without leaking online. Because data stays local, students can safely export and restore their data using the built-in backup tools.

---

## 6. Backup and Restore

Located in the **Student Profile (`profile.html`)**:

1. **Download My Saved Records:**
   - Creates a portable `.json` backup file containing profile data, subjects, tasks, checklists, and theme settings.
2. **Bring Back My Saved Records:**
   - Restores a previously downloaded backup file onto a new laptop, fresh browser, or after clearing history.
3. **Clean All Records:**
   - Clears all saved local records after requiring an explicit user confirmation dialog to prevent accidental data loss.

---

## 7. Folder and File Explanation

### `css/` Folder
- **English:** Contains all visual styling, color palettes, responsive layouts, cards, buttons, themes, calendar design, hover effects, and animations.
- **Tagalog:** Ang `css` folder ang may hawak ng design at hitsura ng Deadline Buddy. Dito kino-control ang colors, layout, buttons, mobile view, at themes.
- **Key Files:**
  - `style.css`: The central design system stylesheet.
  - `fontawesome.min.css`: Local vector icons stylesheet.

---

## 8. `webfonts/` Folder
- **English:** Contains local Font Awesome icon font files (`.woff2`, `.ttf`). This enables all UI icons to render reliably even without internet access.
- **Tagalog:** May hawak ng icon files. Dahil nakasave ito locally, lumalabas pa rin ang mga icons kahit walang Wi-Fi.

---

## 9. `images/` Folder
- **English:** Contains graphical assets, such as the `deadline-buddy-logo.svg`, app mascots, and PWA icon sets.
- **Tagalog:** Naglalaman ng mga logo at visual illustrations ng app.

---

## 10. `js/` Folder
- **English:** Contains all business logic, countdown timers, event handlers, and data persistence scripts.
- **Tagalog:** Ang utak at nagpapagana sa system—nagko-control ng buttons, forms, timers, at notifications.

---

## 11. `js/storage.js`
- **Purpose:** Local record keeper.
- **English:** Manages local storage CRUD operations for accounts, subjects, requirements, checklists, and backup/restore.
- **Tagalog:** Ang tagabantay ng saved records. Kapag nag-save ang student, si `storage.js` ang nagtatago nito sa browser.

---

## 12. `js/deadline.js`
- **Purpose:** Time calculations and deadline urgency classification.
- **Calculates:**
  - Due date & time remaining
  - State: Upcoming, Due Soon, Due Today, Urgent, Overdue, Completed
- **Tagalog:** Nagche-check kung gaano na kalapit ang deadline.

---

## 13. Deadline Rules & Urgency Hierarchy

Deadline Buddy classifies task status using the following priority order:
1. **Completed:** Marked done by the student.
2. **Overdue:** Current time has passed the deadline.
3. **Urgent:** 20 minutes or less remaining.
4. **Due Today:** Due within the current calendar day.
5. **Urgent:** 24 hours or less remaining.
6. **Due Soon:** 3 days or less remaining.
7. **Upcoming:** More than 3 days remaining.

---

## 14. `js/notifications.js`
- **Purpose:** In-browser notification system, sound alerts, and toast banners.
- **English:** Checks active deadlines while the page is open and renders toast alerts and notification bell badges.
- **Tagalog:** Nagpapakita ng notification alerts at tumutunog kapag bukas ang app sa browser.

---

## 15. Reminder Schedule

Deadline Buddy triggers notifications at four critical intervals:
- 🔔 **1 day before** the deadline
- 🔔 **1 hour before** the deadline
- 🔔 **20 minutes before** the deadline
- ⚠️ **When overdue**

*Example Notification:*
> **Deadline Buddy:** *"Research Chapter 2 Draft is due in 20 minutes."*

---

## 16. `js/app.js`
- **Purpose:** Global UI controller.
- **Handles:** Active navigation links, notification dropdowns, avatar loading, live clock ticks, and global toast feedback.

---

## 17. `js/pwa.js`
- **Purpose:** Progressive Web App controller.
- **Handles:** Service Worker registration, "Add to Home Screen" install prompt, and online/offline status detection.

---

## 18. `js/push.js`
- **Purpose:** Web Push notification and backend sync manager.
- **Handles:** Web Push subscription via the Push API, VAPID handshakes, server synchronization, snooze reminders, and in-app Notification Center integration.

---

## 19. Service Worker & Web Push Handling
- **`service-worker.js`**: Listens for background `push` events, creates persistent system notifications with action buttons (Open, Snooze 15m), and routes clicks directly to deep-linked task pages even when the PWA is closed.

---

## 20. Summary of HTML Pages

| Page | English Purpose | Tagalog / Taglish |
| :--- | :--- | :--- |
| **`index.html`** | Welcome, Log In & Sign Up with sliding split-card design. | Login at registration page para sa students. |
| **`dashboard.html`** | Overview of pending tasks, today's classes, today's deadlines, and urgent tasks. | Main summary page kung saan makikita ang tasks at schedule today. |
| **`subjects.html`** | Add, edit, and delete subjects with teacher names and schedules. | Pamamahala ng mga subjects, guro, at schedule. |
| **`tasks.html`** | Comprehensive list of requirements with filters (All, Urgent, Normal, Done) and search. | Listahan ng lahat ng requirements na may search at filter. |
| **`task-form.html`** | Create or edit a requirement with title, date, priority, notes, and checklist. | Form para mag-add o mag-edit ng requirement. |
| **`task-details.html`** | View single task details, interactive countdown timer, and step-by-step checklist. | Kumpletong detalye ng requirement kasama ang checklist. |
| **`calendar.html`** | Monthly interactive calendar plotting all deadlines on their due dates. | Buwanang calendar kung saan nakamarka ang mga deadlines. |
| **`reminders.html`** | Notification center grouping tasks by urgency, with volume and test buttons. | Listahan ng alerts at notification settings. |
| **`profile.html`** | Manage student info, change themes, download backup, restore, or clean records. | Student profile, theme settings, at backup/restore. |

---

## 21. `manifest.json` & `service-worker.js`
- **`manifest.json`**: Enables mobile browsers to install Deadline Buddy to the smartphone home screen like a native app.
- **`service-worker.js`**: Caches all HTML, CSS, JS, images, and fonts so the app opens and functions without internet.

---

## 22. End-to-End System Flow

```
1. Student logs in or creates an account
      ↓
2. Adds subjects with teacher & class schedule
      ↓
3. Adds school requirement (Due date, time, priority, checklist)
      ↓
4. Deadline Buddy saves data locally in localStorage
      ↓
5. Deadline engine calculates status (Urgent, Due Today, etc.)
      ↓
6. Dashboard updates (Today's Classes, Today's Deadlines, Urgent focus)
      ↓
7. Calendar plots requirement on its deadline date
      ↓
8. Reminders page groups task by urgency
      ↓
9. When reminder threshold is reached (1d, 1h, 20m), alert triggers
```

---

## 23. Android Offline & Closed-App Reminder Demonstration Guide

To demonstrate the full offline background reminder capability on mobile:

1. Install the **Deadline Buddy Android App** (via Capacitor / Android Studio APK build).
2. Open the app and allow **Notifications** and **Alarms & Reminders** when prompted in settings.
3. Create a test requirement due **5 minutes from now** with High priority.
4. Go to **Profile** or **Reminders & Alerts** $\rightarrow$ Tap **Send Test Notification** / **Test Native Alarm** to confirm device alarms are active.
5. **Turn Wi-Fi and Mobile Data completely OFF**.
6. **Completely close Deadline Buddy** (swipe it away from the recent apps / app-switcher screen) or lock the phone screen.
7. Wait until the reminder threshold is reached.
8. The **native Android system alarm** triggers and displays the Deadline Buddy notification with sound and vibration—**100% offline with the app completely closed!**

---

## 24. Important Client Turn-Over Notes

### Website / PWA Mode
- Accessible directly through any browser (Chrome, Edge, Safari, Firefox).
- Can be added to the mobile home screen or laptop desktop via **Install App**.
- Offline caching is handled by `service-worker.js`.
- When closed on browsers, background delivery relies on standard Web Push.

### Installed Android Mobile App Mode (Capacitor)
- Packaged as a native Android APK using Capacitor and `@capacitor/local-notifications`.
- Directly schedules reminders with the phone's operating system (`AlarmManager`).
- **Does NOT require the app to stay open in the background**; zero continuous battery drain.
- Works offline, when phone is asleep, and when removed from recent apps.
- No Electron, no Windows `.exe`, and no system tray needed.

---

## 25. Short Summary for Client Presentations

### Short English Explanation
> *"Deadline Buddy is an offline-first academic planner and deadline management system for Grade 11 and Grade 12 students. It organizes subjects, class schedules, requirements, due dates, today's classes, today's deadlines, checklist steps, calendars, and reminders in one place. The browser PWA version allows easy access and offline caching on any device, while the installed Android app uses native device alarms to deliver scheduled reminders even when the app is completely closed, removed from recent apps, asleep, and without internet."*

### Short Tagalog / Taglish Explanation
> *"Ang Deadline Buddy ay isang student planner na tumutulong para hindi makalimutan ang classes at school deadlines. Makikita dito ang classes today, due today, urgent, overdue, at upcoming requirements kasama ang checklist at calendar. Sa browser o PWA, puwede itong i-install at gamitin offline. Sa naka-install na Android app naman, isi-schedule nito ang deadline reminders sa mismong operating system ng phone (AlarmManager)—kaya kahit naka-close ang app, naka-lock ang phone, at patay ang Wi-Fi o data, tutunog at lalabas pa rin ang reminder sa tamang oras nang walang nauubos na battery."*
