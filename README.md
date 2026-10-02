# Deadline Buddy

Deadline Buddy is a student deadline tracker for Grade 11 and Grade 12 students. It helps students save subjects, school requirements, due dates, checklist steps, and reminders.

## Important Reminder Note

There are two ways to use Deadline Buddy:

1. **Website / PWA version**
   - Opens in a browser.
   - Works offline after the files are loaded.
   - Saves records on the same browser.
   - Shows live reminders while the page is open.

2. **Windows app version**
   - Runs with Electron.
   - Can stay active in the Windows system tray.
   - Can show offline Windows notifications while the main Deadline Buddy screen is closed.
   - Does not need XAMPP, MySQL, PHP, Java, or an online backend.

The website alone should not be described as a guaranteed closed-app offline notification system. The Windows packaged app is the correct version for that feature.

## Main Pages

- `index.html` - login and sign-up page
- `dashboard.html` - summary of deadlines and tasks
- `tasks.html` - list of requirements
- `task-form.html` - add or edit a requirement
- `task-details.html` - view one requirement and checklist
- `subjects.html` - manage subjects
- `calendar.html` - view deadlines by date
- `reminders.html` - deadline alerts and notification settings
- `profile.html` - student profile, theme, and saved-record tools

## Data

The current shared app saves records in the browser using local storage.

The Profile page includes:

- **Download My Saved Records**
- **Bring Back My Saved Records**
- **Bring Back Sample Records**

Use these buttons when moving records to another browser or laptop.

## Developer Commands

Install packages:

```text
npm install
```

Run the Windows desktop development version:

```text
npm run dev
```

Check JavaScript files:

```text
npm run check
```

Build a portable Windows app:

```text
npm run build:windows
```

Create an installer:

```text
npm run dist:windows
```

## Windows App Behavior

In the Windows app:

- Closing the main window hides Deadline Buddy.
- Deadline Buddy keeps running in the system tray.
- Local reminder checks continue while the app is in the tray.
- The tray menu includes:
  - Open Deadline Buddy
  - Send Test Notification
  - Start with Windows
  - Exit

Only using **Exit** from the tray fully stops the app and its reminders.

## Reminder Schedule

Deadline Buddy can remind the student:

- 1 day before
- 1 hour before
- 20 minutes before
- when the requirement is overdue

Completed or deleted requirements should not continue sending future reminders.

## Honest Limitation

No app can show a notification while the laptop is completely powered off.

When Deadline Buddy opens again, it checks unfinished requirements and shows the current deadline state.
