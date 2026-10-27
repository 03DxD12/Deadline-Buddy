# Deadline Buddy Client Demo Guide

Use this guide when presenting Deadline Buddy to someone who has never used the system before.

---

## 1. Simple System Explanation

**Deadline Buddy** is an installable, offline-first student academic planner and deadline management Progressive Web App (PWA) designed for Grade 11 and Grade 12 students.

It helps students quickly answer:
- What do I need to finish?
- What classes do I have today?
- What is due today or almost due?
- What should I prioritize first?
- What smaller checklist steps do I still need to complete?
- When are my reminders scheduled?

---

## 2. Core Architecture & Closed-App Explanation

### English Explanation
> "Deadline Buddy is an offline-first academic planner that can also be installed as a mobile application.
>
> When a student creates a requirement, Deadline Buddy automatically schedules the selected deadline reminders directly with the device's operating system (Android AlarmManager).
>
> Because the reminders are scheduled through the operating system, the Deadline Buddy application does not have to remain visibly open or continuously run in the background.
>
> The student may close the application, lock the phone, or use another application. When the scheduled reminder time is reached, the device displays the Deadline Buddy notification with sound and vibration.
>
> The locally scheduled reminders also work without an internet connection after they have been scheduled."

### Taglish Explanation (Para sa Demo / Presentation)
> "Ang Deadline Buddy ay hindi kailangang naka-open palagi para lang mag-check ng deadline.
>
> Kapag nag-save ang student ng requirement, isi-schedule na agad ng Deadline Buddy sa operating system ng phone yung reminders:
> 1. 1 day before
> 2. 1 hour before
> 3. 20 minutes before
> 4. Overdue
>
> Pag na-schedule na iyon sa phone, puwedeng i-close ang Deadline Buddy, i-lock ang phone, mag-open ng ibang app, o patayin ang Wi-Fi at mobile data. Kapag dumating ang reminder time, lalabas pa rin ang notification dahil ang mismong operating system ng Android ang hahawak ng scheduled alarm—walang battery-draining continuous JavaScript loop na kailangan."

---

## 3. Step-by-Step Demonstration Flow

### Step 1: Open the App & Show PWA Installability
1. Open `index.html` in Chrome, Edge, or Safari.
2. Point out the **Install App** button on the landing page.
3. Demonstrate how tapping **Install App** adds Deadline Buddy directly to the home screen or desktop.
4. Show the clean student login and sign-up with Grade 11/12 and track selection (e.g., ASSH, STEM, ABM, TVL).

### Step 2: Showcase the Academic Dashboard
1. Log in (or use sample account: Andrea Santos, Grade 12 ASSH).
2. Point out the real-time summary cards:
   - **Total Requirements**, **Due Today**, **Overdue**, **Completed**
   - **Priority Requirement Focus** with live countdown timer
   - **Today's Classes** (automatically calculated from saved MWF/TTH schedules)
   - **Today's Deadlines** (requirements due before midnight)
3. Note: *"Everything shown here is stored locally in IndexedDB and LocalStorage, which means it continues working smoothly when offline."*

### Step 3: Manage Subjects & Class Schedules
1. Navigate to **Subjects**.
2. Show existing subjects (Creative Writing, Practical Research 2, General Mathematics).
3. Click **Add Subject** and save a subject with a schedule (e.g., `MWF 9:00 AM - Room 204`).
4. Explain how this schedule dynamically powers the dashboard's "Today's Classes" card.

### Step 4: Add a Requirement with Smart Reminders
1. Click **Add Requirement** (`task-form.html`).
2. Add a sample requirement:
   - **Title:** Practical Research Chapter 2 Draft
   - **Subject:** Practical Research 2
   - **Type:** Research / Paper
   - **Due Date & Time:** Set to today or tomorrow
   - **Priority:** High / Urgent
3. Show the **Reminder Schedule Checkboxes**:
   - `☑ 1 day before`
   - `☑ 1 hour before`
   - `☑ 20 minutes before`
   - `☑ When overdue`
4. Add checklist subtasks:
   - `Gather local literature (5 studies)`
   - `Draft conceptual framework`
   - `Complete methodology section`
5. Click **Save Requirement**.

### Step 5: Requirement Details, Checklist & Snooze
1. Click on the newly created task to view `task-details.html`.
2. Check off subtasks and observe the progress bar update dynamically.
3. Show the **Countdown Timer** and the **Snooze (+15m, +1h)** actions.

### Step 6: Reminders Hub & Notification Center
1. Open **Alerts** (`reminders.html`).
2. Show the segmented sections:
   - **Deadlines & Alerts:** Categorized into Overdue, Due Today, Tomorrow, and Upcoming.
   - **Study Reminders:** Dedicated study session scheduling with recurrence rules (Daily, Weekdays, MWF).
   - **Notification Center:** In-app notification history with filters (`All`, `Unread`, `Deadlines`, `Study`, `System`).
   - **Push & Settings:** Web Push status, notification switches, Quiet Hours, and the **Send Test Push Alert** button.

### Step 7: Academic Calendar
1. Open **Calendar** (`calendar.html`).
2. View the full monthly grid with date badges and color-coded deadline indicators.
3. Click a date to inspect all requirements due on that specific day.

### Step 8: Profile, Offline Data & Backup
1. Open **Profile** (`profile.html`).
2. Show:
   - Profile information & custom avatar upload.
   - **Theme Selector** (Soft Pink & Clean Blue).
   - **Notifications & System Status** (Permission: Allowed, PWA: Installed, Offline Files: Ready).
   - **Save & Bring Back Records:** Demonstrate **Download My Saved Records** (JSON export) and **Bring Back My Saved Records** (JSON import).

---

## 4. How to Explain Offline & Background Delivery

| Scenario | What Happens |
| :--- | :--- |
| **PWA Open + Offline** | Full access to cached interface, local subjects, requirements, checklists, and in-app reminder alerts. |
| **PWA Closed + Online** | Service Worker receives Web Push messages and displays persistent system notifications. Tapping opens directly to the exact task. |
| **PWA Closed + Completely Offline** | Pure PWAs cannot guarantee exact offline closed-app alarms without network connectivity because browsers do not run continuous background daemons. As soon as connectivity returns or the student opens the app, all records and pending reminders are evaluated. |
