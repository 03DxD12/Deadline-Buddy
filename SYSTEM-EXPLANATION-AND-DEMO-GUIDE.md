# Deadline Buddy System Explanation, Code Architecture, and Client Demo Guide

## 1. Deadline Buddy Overview

Deadline Buddy is a student deadline and requirement tracker for Grade 11 and Grade 12 students. It helps students organize subjects, school requirements, due dates, checklist steps, reminders, profile information, and saved records.

The main problem it solves is missed or forgotten schoolwork. A student can add a requirement, set a due date and time, track checklist progress, and see whether the requirement is upcoming, due soon, due today, urgent, overdue, or completed.

Deadline Buddy currently has two main forms:

**Browser / PWA Version**

- Uses HTML, CSS, and JavaScript.
- Saves records in the same browser using `localStorage`.
- Can load offline through the Service Worker after the app has been opened from `localhost` or HTTPS.
- Shows live reminder popups and browser notifications while the page is open.
- Does not guarantee closed-window offline reminders by itself.

**Windows Electron Version**

- Uses the same HTML, CSS, and JavaScript, plus Electron.
- Adds a Windows system tray and native Windows notifications.
- Can continue checking reminders when the main window is closed, as long as Deadline Buddy is still running in the tray.
- If the user fully exits from the tray, background reminders stop.
- Source code exists, but no packaged `dist` build was found during inspection. Treat the final `.exe` package as not yet verified.

## 2. How the Entire System Works

Basic browser flow:

```text
Student opens Deadline Buddy
        |
        v
Logs in or creates an account
        |
        v
Adds subjects
        |
        v
Adds school requirements
        |
        v
Sets deadline and checklist
        |
        v
Deadline Buddy saves the data locally
        |
        v
Deadline engine checks status and countdown
        |
        v
Dashboard, Tasks, Calendar, and Reminders update
        |
        v
Browser reminder appears while the page is open
```

Windows Electron flow:

```text
Requirement is saved
        |
        v
device-reminders.js sends deadline data to Electron
        |
        v
Electron stores reminder state in the app user-data folder
        |
        v
Main window may be closed
        |
        v
Deadline Buddy stays in the system tray
        |
        v
Electron checks deadlines every 30 seconds
        |
        v
Windows notification appears when a reminder is due
```

## 3. Browser/PWA vs Windows App

| Feature | Browser / PWA | Windows Electron App |
|---|---|---|
| Opens in browser | Yes | No, opens as desktop app |
| Uses HTML/CSS/JS | Yes | Yes |
| Offline interface | Yes, after Service Worker cache | Yes |
| Saves student data | Browser `localStorage` | Renderer still uses local app web storage; Electron also stores reminder state |
| Live reminders while open | Yes | Yes |
| Closed-window reminder checking | Not guaranteed | Implemented in Electron source while app remains in tray |
| Works after fully exiting app | No | No |
| Needs online backend | No | No |
| Packaged EXE verified | Not applicable | Not yet verified in this workspace |

## 4. Folder Structure

Actual project structure:

```text
Deadline Buddy/
|
|-- css/
|   `-- style.css
|
|-- electron/
|   |-- main.js
|   `-- preload.js
|
|-- images/
|   `-- deadline-buddy-logo.svg
|
|-- js/
|   |-- app.js
|   |-- deadline.js
|   |-- device-reminders.js
|   |-- notifications.js
|   |-- pwa.js
|   `-- storage.js
|
|-- index.html
|-- dashboard.html
|-- tasks.html
|-- task-form.html
|-- task-details.html
|-- subjects.html
|-- calendar.html
|-- reminders.html
|-- profile.html
|-- manifest.json
|-- service-worker.js
|-- package.json
|-- package-lock.json
|-- README.md
|-- CLIENT-DEMO-GUIDE.md
|-- READ ME FIRST.txt
`-- SYSTEM-EXPLANATION-AND-DEMO-GUIDE.md
```

## 5. HTML Explanation

HTML provides the structure of each page. It creates the forms, buttons, cards, navigation, headings, calendar containers, notification areas, and profile sections that the student sees.

All main HTML pages load:

- `js/storage.js`
- `js/deadline.js`
- `js/notifications.js`
- `js/app.js`
- `js/pwa.js`
- `js/device-reminders.js`

### index.html

Purpose:

- Login and sign-up page.

Main visible parts:

- Log In tab
- Sign Up tab
- Username and password fields
- Show password buttons
- Remember my login checkbox
- Grade level and strand fields

Data used:

- Reads accounts from `localStorage`.
- Saves accounts to `localStorage`.
- Saves remembered login data when enabled.

Important note:

- The current prototype stores account passwords and remembered login data in `localStorage`. This is acceptable for a school prototype but should not be described as secure production authentication.

Demo:

- Create a sample account and log in.

### dashboard.html

Purpose:

- Shows the student's overall requirement status.

Main visible parts:

- Total Requirements
- Due Today
- Overdue
- Completed
- Priority Requirement Focus
- Today's Classes
- Today's Deadlines
- Upcoming Academic Tasks
- Notification bell

Data used:

- Reads tasks and subjects from `storage.js`.
- Uses `deadline.js` to calculate status and countdown.
- Uses saved subject schedules, such as `MWF` and `TTH`, to show classes for the current day.
- Uses saved task due dates to show unfinished requirements due today.

Demo:

- Point out the urgent focus card, Today's Classes, Today's Deadlines, and time-left labels.

### tasks.html

Purpose:

- Shows all saved requirements.

Main visible parts:

- Status tabs
- Search bar
- Subject filter
- Category filter
- Requirement cards
- Details, Edit, Done/Undo buttons

Data used:

- Reads and updates tasks from `storage.js`.
- Uses `deadline.js` for urgent/overdue filtering.

Demo:

- Search a task, filter by status, mark one as done, then undo it.

### task-form.html

Purpose:

- Adds or edits an academic requirement.

Main visible parts:

- Requirement title
- Subject
- Category
- Due date and time picker
- Priority
- Status
- Notes
- Checklist steps
- Deadline preview

Data used:

- Reads subjects from `storage.js`.
- Saves or updates requirements through `Storage.saveTask()` or `Storage.updateTask()`.
- Uses `deadline.js` for deadline preview text.

Demo:

- Add "Research Chapter 2 Draft" with checklist steps.

### task-details.html

Purpose:

- Shows full information for one requirement.

Main visible parts:

- Requirement title
- Subject
- Due date
- Priority
- Status
- Notes
- Checklist

Data used:

- Reads one task from `storage.js`.
- Uses `deadline.js` for deadline status.

Demo:

- Open a task and check/uncheck checklist items.

### subjects.html

Purpose:

- Manages subjects.

Main visible parts:

- Subject cards
- Add subject form/modal
- Edit and delete actions
- Teacher and schedule notes

Data used:

- Reads, adds, updates, and deletes subjects through `storage.js`.

Demo:

- Add Practical Research 2, Mr. Ramos, TTH 1:00 PM.

### calendar.html

Purpose:

- Shows deadlines by date.

Main visible parts:

- Monthly calendar
- Previous/next controls
- Deadline labels
- Selected-date task details
- Mobile floating add button

Data used:

- Reads tasks and subjects from `storage.js`.
- Uses `deadline.js` for labels and status.

Demo:

- Show a deadline on the calendar and open its details.

### reminders.html

Purpose:

- Shows deadline alerts and reminder settings.

Main visible parts:

- Deadline notification status
- Send Test Notification
- Reminder preferences
- Start with Windows checkbox, available in Electron
- Overdue group
- Due Today group
- Urgent group
- Due Soon & Upcoming group
- Notification history log

Data used:

- Reads tasks and notification history from `storage.js`.
- Uses `deadline.js` for grouping.
- Uses `device-reminders.js` for test notifications and Electron bridge.

Demo:

- Show grouped reminders and click Send Test Notification.

### profile.html

Purpose:

- Manages student profile, theme, profile image, and backup/restore.

Main visible parts:

- Name
- Grade level
- Strand/track
- School name
- Section/room
- Profile picture upload
- Theme choices
- Download My Saved Records
- Bring Back My Saved Records
- Bring Back Sample Records

Data used:

- Reads and saves profile, theme, tasks, subjects, notifications, and backup data through `storage.js`.

Demo:

- Change theme, upload profile photo, and download saved records.

## 6. CSS Explanation

`css/style.css` controls the look and feel of Deadline Buddy.

It handles:

- Global reset and font styles
- Default Pink theme
- Clean Blue theme
- Sidebar
- Topbar
- Buttons
- Cards
- Badges
- Notification bell
- Login and sign-up layout
- Forms
- Date/time picker
- Calendar layout
- Reminders page layout
- Profile page layout
- Tooltips
- Toast messages
- Offline banner
- PWA install prompt
- Mobile bottom navigation
- Responsive breakpoints

If `style.css` is missing:

- Pages may still show text and forms.
- The app will lose layout, colors, spacing, mobile responsiveness, animations, and polished design.

## 7. JavaScript Explanation

JavaScript gives Deadline Buddy its behavior. HTML creates the page, CSS designs it, and JavaScript makes the buttons, forms, deadlines, filters, reminders, storage, and page updates work.

### js/storage.js

Purpose:

- Main local data engine.

Uses:

- `localStorage`

Stores:

- User profile
- Accounts
- Saved login
- Theme
- Subjects
- Tasks/requirements
- Checklist items inside tasks
- Notifications
- Profile picture when saved in profile data

Major functions:

- `initStorage()`
- `getUser()`
- `saveUser()`
- `getAccounts()`
- `createAccount()`
- `getSavedLogin()`
- `saveSavedLogin()`
- `getSubjects()`
- `saveSubject()`
- `updateSubject()`
- `deleteSubject()`
- `getTasks()`
- `saveTask()`
- `updateTask()`
- `deleteTask()`
- `updateTaskStatus()`
- `exportBackupJSON()`
- `importBackupJSON()`
- `seedDemoData()`

If this file breaks:

- Login, profile, subjects, requirements, checklist, backup, restore, theme, and notifications can stop working.

### js/deadline.js

Purpose:

- Shared deadline calculation engine.

Important logic:

- Parses deadline date/time.
- Calculates time remaining.
- Determines deadline state.
- Formats deadline text.
- Calculates checklist progress.

Actual deadline state rules:

1. Completed if task status is `Completed`.
2. Overdue if due time has passed.
3. Urgent if 20 minutes or less remain.
4. Due Today if deadline date is today.
5. Urgent if 24 hours or less remain.
6. Due Soon if 3 days or less remain.
7. Upcoming for later dates.

If this file breaks:

- Dashboard, tasks, calendar, reminders, and countdown labels may become wrong.

### js/notifications.js

Purpose:

- Browser reminder and notification history engine.

Actual alert thresholds:

- Overdue: after deadline passes
- 20 minutes before
- 1 hour before
- 1 day before

It checks every 30 seconds.

It creates:

- Toast popup
- Notification history record
- Browser notification if permission is granted
- Notification bell update

Important:

- This works best while Deadline Buddy is open in the browser. It is not the closed-window Windows reminder engine.

If this file breaks:

- Browser alerts, notification history, and notification bell updates may fail.

### js/app.js

Purpose:

- Shared UI controller.

Handles:

- Theme application
- Sidebar drawer
- Mobile menu
- Notification bell dropdown
- Button press effects
- Password show/hide
- Tooltips
- Offline/online banner
- PWA install prompt
- Toast messages
- Countdown/timer text refresh every 30 seconds

Uses:

- `sessionStorage` for one-time toast messages after redirects.
- `localStorage` for saved theme/install prompt dismissal.

If this file breaks:

- Common UI behavior may stop working on many pages.

### js/pwa.js

Purpose:

- Registers the Service Worker for the PWA/offline shell.

Important:

- It does not use an online backend.
- It does not handle Windows background notifications.
- It skips Service Worker registration when opened through `file://`.

If this file breaks:

- PWA/offline caching may not activate.

### js/device-reminders.js

Purpose:

- Bridge between normal web pages and Electron device reminders.

Browser behavior:

- Shows reminder status.
- Can send a browser test notification if supported and allowed.

Electron behavior:

- Detects `window.DeadlineBuddyDeviceReminders`.
- Sends task data and reminder preferences to Electron.
- Sends test notification request to Electron.
- Handles Start with Windows checkbox if running in Electron.

If this file breaks:

- Browser test notification and Electron sync may fail.

## 8. How the Files Connect

Example: Dashboard

```text
dashboard.html
    |
    +-- css/style.css
    +-- js/storage.js
    +-- js/deadline.js
    +-- js/notifications.js
    +-- js/app.js
    +-- js/pwa.js
    +-- js/device-reminders.js
```

Plain explanation:

- `dashboard.html` creates the dashboard structure.
- `style.css` controls the design.
- `storage.js` gets saved requirements.
- `deadline.js` calculates status and countdown.
- `notifications.js` checks browser reminders.
- `app.js` controls shared UI.
- `pwa.js` registers offline caching.
- `device-reminders.js` syncs with Electron if inside the Windows app.

Example: Add Requirement

```text
task-form.html
    |
    +-- storage.js saves requirement
    +-- deadline.js previews deadline
    +-- device-reminders.js syncs new task to Electron
```

Example: Reminders

```text
reminders.html
    |
    +-- storage.js reads tasks and history
    +-- deadline.js groups urgency
    +-- notifications.js creates browser alerts
    +-- device-reminders.js handles test notification and Electron bridge
```

## 9. Local Data Storage

Deadline Buddy currently uses:

- `localStorage` for main app records.
- `sessionStorage` only for short redirect toast messages.
- Electron file storage only for reminder state in `deadline-reminders.json`.

It does not currently use:

- MySQL
- PHP
- XAMPP
- IndexedDB
- Firebase
- Online database
- SQLite

Data saved in `localStorage`:

- Profile
- Accounts
- Saved login
- Theme
- Subjects
- Tasks/requirements
- Checklist inside tasks
- Notifications
- Backup/restored data

After browser refresh:

- Data remains.

After closing the browser:

- Data remains unless browser storage is cleared.

After restarting the laptop:

- Data remains in the same browser profile unless storage is cleared.

Different browser:

- Does not automatically share the same data.

Different laptop:

- Does not automatically share the same data.

Backup and restore:

- Download My Saved Records exports JSON.
- Bring Back My Saved Records imports that JSON.

Security note:

- The current prototype stores account passwords and remembered login information in `localStorage`. Do not present this as secure production authentication. It is acceptable for a local school prototype but should be improved before real-world deployment.

## 10. Deadline Checking System

Main file:

```text
js/deadline.js
```

Deadline logic:

```text
Completed
Overdue
Urgent: 20 minutes or less
Due Today
Urgent: 24 hours or less
Due Soon: 3 days or less
Upcoming
```

Countdown examples:

```text
3d 4h remaining
1h 20m remaining
15m remaining
Overdue by 2h 5m
Task Completed
```

When deadline passes:

- State becomes Overdue if the task is not completed.

When requirement is completed:

- Countdown text becomes Task Completed.
- Browser reminder checks skip completed tasks.
- Electron reminder sync sends the updated task list.

When deadline is edited:

- Task data is updated in storage.
- Electron bridge resyncs tasks in the Windows app.

When requirement is deleted:

- Task is removed from storage.
- Electron bridge resyncs tasks, removing old reminder keys for deleted tasks.

## 11. Reminder System

### Browser Reminder

Files:

- `js/notifications.js`
- `js/app.js`
- `js/device-reminders.js`

Browser reminder behavior:

- Checks deadlines every 30 seconds.
- Creates toast popup.
- Adds item to notification history.
- Updates notification bell.
- Shows browser notification if permission is granted.

Reminder thresholds:

- 1 day before
- 1 hour before
- 20 minutes before
- Overdue

Important:

- Browser reminders are page-based. They work best while Deadline Buddy is open.

### Windows Offline Reminder

Files:

- `electron/main.js`
- `electron/preload.js`
- `js/device-reminders.js`

Electron behavior:

- Creates a desktop window.
- Loads `index.html`.
- Adds system tray menu.
- Hides window on close instead of fully quitting.
- Checks reminder state every 30 seconds.
- Shows native Windows notifications.
- Prevents multiple app instances.
- Includes Start with Windows support.

Important:

- Closing the main window does not fully exit Deadline Buddy.
- Reminders continue only while the Electron app is still running in the tray.
- If the user selects Exit in the tray, reminders stop.
- If the laptop is powered off, no notification can physically appear.

Status:

- Electron source code exists.
- A packaged Windows build was not found in `dist`, so packaged EXE testing is not verified.

## 12. PWA System

A PWA is a website that can behave more like an app. It can be installed from supported browsers and can cache files for offline access.

### manifest.json

Purpose:

- Provides app name, icon, theme color, start page, and display mode.

### service-worker.js

Purpose:

- Caches the app shell.
- Allows offline loading of core files after first proper load.

Cached files include:

- HTML pages
- CSS
- JavaScript
- Logo
- Manifest

Important:

- Service Worker caching is different from Electron background reminders.
- The Service Worker helps the browser/PWA load offline.
- It is not the Windows reminder engine.

### js/pwa.js

Purpose:

- Registers `service-worker.js`.
- Skips registration for direct `file://` opening.

For proper PWA testing, use:

```text
http://127.0.0.1:5500/index.html
```

or an HTTPS hosted site.

## 13. Electron Windows System

Electron lets the existing HTML, CSS, and JavaScript app run as a Windows desktop application.

### electron/main.js

Implemented:

- Creates BrowserWindow
- Loads `index.html`
- Hides main window on close
- Keeps tray app running
- Creates tray menu
- Sends native Windows notifications
- Supports Send Test Notification
- Supports Start with Windows
- Prevents multiple instances
- Stores reminder state in Electron user-data folder as `deadline-reminders.json`
- Checks reminders every 30 seconds

### electron/preload.js

Purpose:

- Safely exposes selected Electron functions to the normal webpage.

Exposed bridge:

- `syncTasks()`
- `sendTestNotification()`
- `setStartWithWindows()`
- `getStartWithWindows()`

Browser:

```text
HTML + CSS + JavaScript
```

Windows:

```text
HTML + CSS + JavaScript + Electron
```

## 14. Client Demo Preparation

Prepare two demos:

**Option A: Browser/PWA Demo**

- Best for showing interface, tasks, subjects, calendar, backup, restore, and responsive design.

**Option B: Windows Offline Reminder Demo**

- Best for proving offline closed-window reminder behavior.
- Only claim it works after testing the packaged Electron version.

## 15. Browser Demo Step-by-Step

### Step 1: Login

WHAT TO CLICK:

- Open `index.html` or local server URL.
- Click Sign Up.

ENTER:

```text
Name: Andrea Santos
Username: andrea12
Password: 1234
Grade Level: Grade 12
Strand: ASSH
```

WHAT TO SAY:

"This page lets the student create a local account and log in to Deadline Buddy."

### Step 2: Dashboard

WHAT TO CLICK:

- Open Dashboard.

WHAT CLIENT SHOULD SEE:

- Total Requirements
- Due Today
- Overdue
- Completed
- Priority Requirement Focus
- Upcoming Academic Tasks

WHAT TO SAY:

"The dashboard gives a quick overview of the student's school requirements and shows what should be prioritized."

### Step 3: Subjects

WHAT TO CLICK:

- Subjects
- Add Subject

ENTER:

```text
Subject: Practical Research 2
Teacher: Mr. Ramos
Schedule: TTH 1:00 PM
```

WHAT TO SAY:

"Subjects help group requirements properly."

### Step 4: Add Requirement

WHAT TO CLICK:

- Add Requirement

ENTER:

```text
Title: Research Chapter 2 Draft
Subject: Practical Research 2
Category: Research Requirement
Priority: High
Deadline: Tomorrow or a few minutes from now
```

Checklist:

```text
Gather survey data
Write methodology
Review grammar
Submit final draft
```

WHAT TO SAY:

"The student can set the exact deadline, choose priority, and break the work into checklist steps."

### Step 5: Tasks

WHAT TO CLICK:

- Tasks & Requirements
- Search or filter
- Click Done

WHAT TO SAY:

"This page lists all requirements and lets the student search, filter, edit, view details, or mark work as completed."

### Step 6: Task Details

WHAT TO CLICK:

- Details on a requirement.

WHAT TO SAY:

"This page shows the full requirement and checklist progress."

### Step 7: Reminders

WHAT TO CLICK:

- Reminders & Alerts
- Send Test Notification

WHAT TO SAY:

"This page groups requirements by urgency and shows notification history. Browser reminders work while Deadline Buddy is open."

### Step 8: Calendar

WHAT TO CLICK:

- Calendar

WHAT TO SAY:

"The calendar helps students see which dates have deadlines."

### Step 9: Profile

WHAT TO CLICK:

- Student Profile
- Change theme
- Download My Saved Records

WHAT TO SAY:

"The profile page stores student details and lets the student save a backup copy of records."

## 16. Windows Offline Notification Demo

Only use this demo after the Electron app is running or packaged.

### Step 1

Open:

```text
Deadline Buddy.exe
```

Expected:

- Deadline Buddy opens as a Windows app.

### Step 2

Create a requirement:

```text
Title: Offline Reminder Test
Deadline: A few minutes from current time
Priority: High
```

Expected:

- Requirement saves successfully.

### Step 3

Open Reminders & Alerts.

Click:

```text
Send Test Notification
```

Expected:

- Windows notification appears.

### Step 4

Turn Wi-Fi off.

Expected:

- App still works because data is local.

### Step 5

Close the main Deadline Buddy window.

Expected:

- Window hides.
- Deadline Buddy remains in system tray.

### Step 6

Wait for the reminder.

Expected:

- Windows notification appears if the app is still running in the tray and Windows notifications are allowed.

If notification does not appear:

- Check Windows notification permission.
- Check if Deadline Buddy is still in the tray.
- Check that the app was not fully exited.
- Check system date and time.
- Check whether the requirement is already completed.
- Use Send Test Notification.

Do not claim this demo passed unless it was actually tested on the target Windows device.

## 17. Sample Demo Data

Student:

```text
Name: Andrea Santos
Grade: Grade 12
Section / Strand: ASSH
```

Subject:

```text
Subject: Practical Research 2
Teacher: Mr. Ramos
Schedule: TTH 1:00 PM
```

Requirement:

```text
Title: Research Chapter 2 Draft
Category: Research Requirement
Priority: High
```

Checklist:

```text
Gather survey data
Write methodology
Review grammar
Submit final draft
```

## 18. Troubleshooting

Problem:
Deadline Buddy has no design.

Check:

- `css/style.css`

Problem:
Buttons do not work.

Check:

- JavaScript files are loaded.
- Browser console for errors.

Problem:
Saved records disappeared.

Check:

- Correct browser profile.
- Browser storage was not cleared.
- Try Restore Saved Records if a backup exists.

Problem:
Offline website does not open.

Check:

- Was it first opened through localhost or HTTPS?
- Is `service-worker.js` registered?

Problem:
Windows notification does not appear.

Check:

- Windows notifications are allowed.
- Electron app is still running.
- App is in tray.
- Requirement is unfinished.
- System date/time is correct.
- Use Send Test Notification.

Problem:
Countdown is incorrect.

Check:

- Due date.
- Due time.
- Device date/time.
- `js/deadline.js`.

## 19. Possible Client / Panel Questions and Answers

Q: Does Deadline Buddy need internet?

A: The main records and requirements are stored locally, so normal use does not need internet. PWA offline loading works after the app has been properly opened and cached. The Windows app is designed to work offline.

Q: Where are records saved?

A: In the browser version, records are saved in `localStorage` on the same browser and laptop.

Q: Why not use MySQL?

A: The project is designed as an offline-first student app. It does not need a database server for the current scope.

Q: Can the student use it on another laptop?

A: Not automatically. They should use Download My Saved Records, then Bring Back My Saved Records on the other laptop/browser.

Q: What if browser data is deleted?

A: The records can be lost unless the student has downloaded a backup file.

Q: How do reminders work?

A: Browser reminders check deadlines while the page is open. Electron reminders can continue while the Windows app is running in the system tray.

Q: Will reminders work if the Windows app window is closed?

A: Yes, if the Electron app remains running in the system tray. If the user fully exits from the tray, reminders stop.

Q: What if the laptop is turned off?

A: No app can show a notification while the laptop is powered off.

Q: What is Electron for?

A: Electron turns the HTML/CSS/JavaScript app into a Windows desktop app and adds tray/background notification behavior.

Q: What is the Service Worker for?

A: It caches app files so the browser/PWA can load offline. It is not the Windows reminder engine.

Q: What happens when a requirement is edited?

A: The saved task is updated in localStorage. If running in Electron, device-reminders syncs the updated task list to Electron.

Q: What happens when a task is completed?

A: Browser reminders skip completed tasks. The countdown shows Task Completed. Electron receives the updated task list.

Q: How do backup and restore work?

A: Backup exports a JSON file. Restore reads that JSON file and puts the saved records back into localStorage.

## 20. Short English Client Explanation

Deadline Buddy is a student deadline tracker for Grade 11 and Grade 12 students. It helps students save subjects, requirements, due dates, priorities, checklist steps, and reminders. The app checks deadlines and shows whether work is upcoming, due soon, urgent, overdue, or completed.

The browser/PWA version is useful for normal offline access while the app is open. The Windows Electron version adds desktop behavior, such as staying in the system tray and showing Windows notifications while the main window is closed, as long as Deadline Buddy is still running.

## 21. Complete Tagalog / Taglish Explanation

Ang Deadline Buddy ay isang student deadline tracker para sa Grade 11 at Grade 12 students. Dito puwedeng mag-save ang student ng subjects, school requirements, due dates, priority, checklist steps, at reminders.

Ang HTML ang nagsisilbing structure o laman ng bawat page. Ito ang gumagawa ng forms, buttons, cards, headings, at navigation.

Ang CSS ang bahala sa design, kulay, layout, spacing, buttons, cards, mobile view, animation, at themes.

Ang JavaScript ang nagpapagana sa system. Ito ang nagha-handle ng pag-save ng records, pag-check ng deadlines, countdown, filters, reminders, notification bell, backup, restore, at profile.

Ang PWA ay website na puwedeng mag-behave na parang app at puwedeng mag-load offline kapag na-cache na ang files. Ang Service Worker ang tumutulong sa offline loading.

Ang Electron ang ginagamit para gawing Windows desktop app ang existing HTML, CSS, at JavaScript version ng Deadline Buddy. Sa Windows app version, puwedeng manatili sa system tray ang app para patuloy na mag-check ng reminders kahit sarado ang main window.

Important: Kapag browser version lang, mas reliable ang reminders habang naka-open ang Deadline Buddy page. Kapag Windows app version, puwedeng gumana ang background reminders basta running pa rin ang app sa tray. Kapag fully exited ang app, titigil ang background reminders.

## 22. Tagalog / Taglish Demo Script

PAGE:
Login

GAGAWIN:
Buksan ang Deadline Buddy at gumawa ng sample account.

SASABIHIN:

"Ito ang login at sign-up page. Dito puwedeng gumawa ng account ang student at mag-login gamit ang username at password."

IPAPAKITA:

- Log In
- Sign Up
- Show password
- Remember my login

PAGE:
Dashboard

GAGAWIN:
Buksan ang Dashboard.

SASABIHIN:

"Sa Dashboard makikita agad ng student kung ilan ang requirements niya, kung may due today, overdue, completed, at kung ano ang pinaka-urgent na kailangan niyang unahin."

IPAPAKITA:

- Total Requirements
- Due Today
- Overdue
- Completed
- Priority Requirement Focus
- Countdown

PAGE:
Subjects

GAGAWIN:
Mag-add ng subject.

SASABIHIN:

"Dito sine-save ang subjects, teacher name, at schedule para maayos na ma-group ang requirements."

PAGE:
Add Requirement

GAGAWIN:
Mag-add ng Research Chapter 2 Draft.

SASABIHIN:

"Dito nilalagay ang school requirement, due date, priority, notes, at checklist steps."

IPAPAKITA:

- Date picker
- Deadline clock
- Priority
- Checklist
- Deadline preview

PAGE:
Tasks

GAGAWIN:
Ipakita ang filters at Done button.

SASABIHIN:

"Dito makikita lahat ng saved requirements. Puwedeng mag-search, mag-filter, mag-edit, at magmark as done."

PAGE:
Task Details

GAGAWIN:
Buksan ang Details.

SASABIHIN:

"Dito makikita ang complete information ng isang requirement at checklist progress."

PAGE:
Reminders

GAGAWIN:
Buksan ang Reminders & Alerts.

SASABIHIN:

"Dito naka-group ang requirements depende sa urgency: overdue, due today, urgent, at upcoming."

PAGE:
Calendar

GAGAWIN:
Buksan ang Calendar.

SASABIHIN:

"Dito makikita ang deadlines ayon sa date para mas madaling makita kung aling araw maraming gagawin."

PAGE:
Profile

GAGAWIN:
Ipakita profile, theme, backup, restore.

SASABIHIN:

"Dito puwedeng baguhin ang profile, theme, at mag-download o mag-restore ng saved records."

PAGE:
Windows Offline Notification Demo

GAGAWIN:
Gamitin ang Electron/Windows app version.

SASABIHIN:

"Para sa closed-window offline reminders, ang Windows app version ang ginagamit. Kapag sinara ang main window, mananatili ang Deadline Buddy sa system tray at patuloy na magche-check ng deadlines."

IPAPAKITA:

- Send Test Notification
- Close main window
- System tray
- Windows notification

## 23. Final Quick Reference

```text
HTML
= Page structure

CSS
= Design and layout

JavaScript
= System behavior and logic

storage.js
= Saves and retrieves local records

deadline.js
= Checks deadlines and countdowns

notifications.js
= Browser alerts and notification history

device-reminders.js
= Connects pages to device/Electron reminders

pwa.js
= Registers PWA Service Worker

service-worker.js
= Offline website caching

manifest.json
= Installable PWA information

electron/main.js
= Windows desktop, tray, and background reminder behavior

electron/preload.js
= Safe connection between webpage and Electron
```

## Current Status Summary

Working now:

- HTML pages
- CSS design
- localStorage records
- Login/sign-up prototype
- Dashboard
- Subjects
- Requirements
- Checklist
- Calendar
- Reminders page
- Browser reminder logic while page is open
- Backup and restore
- Theme switching
- PWA files
- Electron source files

Partially implemented:

- Electron offline reminder behavior exists in source but still needs packaged Windows testing.
- Start with Windows exists in Electron source but should be tested in packaged app.

Not yet verified:

- Final packaged `.exe`
- Windows offline notification demo on target client device
- Installed PWA behavior on all devices
