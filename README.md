# Deadline Buddy

Deadline Buddy is a simple academic deadline tracker for Grade 11 and Grade 12 students. It helps users create a local account, save subjects, school requirements, due dates, reminders, and checklist steps.

## How To Open

This version can still open as a static website for normal testing. It does not need XAMPP, PHP, or MySQL.

Open this file in a browser:

```text
index.html
```

For real background reminders after the tab is closed, use the optional Web Push backend. That part needs Node.js because a browser-only website cannot schedule and send true Web Push reminders by itself.

You can also open:

```text
dashboard.html
```

For a simple presentation script, open:

```text
CLIENT-DEMO-GUIDE.md
```

## Main Pages

- `index.html` - login and sign-up page
- `dashboard.html` - overview of deadlines and tasks
- `tasks.html` - list of requirements
- `task-form.html` - add or edit a requirement
- `task-details.html` - view one requirement and checklist
- `subjects.html` - manage subjects
- `calendar.html` - view deadlines by date
- `reminders.html` - deadline alerts and notification history
- `profile.html` - student profile and saved-records tools

## Features

- Add, edit, and delete academic requirements
- Create a local student account
- Log in with username and password
- Remember login on the same browser
- Choose Grade 11 or Grade 12
- Add subjects
- Add checklist steps for each task
- Preview reminder times when setting a deadline
- Deadline status badges
- Alerts for overdue tasks
- Alerts 20 minutes before a deadline
- Alerts 1 day before a deadline
- Browser notification support
- PWA manifest and service worker
- Optional Web Push backend for closed-tab reminders
- Responsive mobile calendar
- Smooth UI animations and effects
- Save and restore records using a downloaded file
- Reset sample records for practice or presentation

## Where Data Is Saved

The app saves accounts and records in the browser using local storage. This means records stay in the same browser on the same laptop.

If the user changes laptop or browser, they should use:

- **Download My Saved Records**
- **Bring Back My Saved Records**

These are found on the Profile page.

## Backup Explanation

**Download My Saved Records** saves a copy of the student's profile, subjects, deadlines, checklist steps, and alerts.

**Bring Back My Saved Records** loads that saved copy back into the app.

**Bring Back Sample Records** clears the records in the current browser and restores sample Grade 12 ASSH tasks. Use this only for practice or presentation.

## Project Structure

```text
css/
  style.css

js/
  app.js
  deadline.js
  notifications.js
  storage.js

*.html
```

## Notes For The Client

Because the main student records are browser-based, accounts and normal records are saved locally in the browser. To move records to another laptop or browser, use the saved-records feature on the Profile page.

## Real Web Push Reminder Mode

The old live reminders work only while Deadline Buddy is open. The upgraded Web Push mode adds:

- `manifest.json`
- `service-worker.js`
- `js/pwa.js`
- `backend/server.js`
- `.env.example`

This mode can show reminders after the Deadline Buddy tab is closed, as long as:

- the student enabled notifications
- the push backend is running
- the browser/device can receive push messages
- the device is not completely powered off

### Backend Setup

Install dependencies:

```text
npm install
```

Generate VAPID keys:

```text
npm run web-push:keys
```

Copy `.env.example` to `.env`, then paste the generated keys:

```text
VAPID_PUBLIC_KEY=...
VAPID_PRIVATE_KEY=...
```

Start the backend:

```text
npm run dev
```

The backend runs at:

```text
http://localhost:3001
```

Then open Deadline Buddy and go to:

```text
reminders.html
```

Use:

```text
Enable Deadline Notifications
Send Test Notification
```

### Important Reminder Note

If the laptop is completely turned off, no notification can appear at that exact time. Web Push can work after the app tab is closed, but it still depends on the browser, operating system, internet connection, and push service.
