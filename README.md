# Deadline Buddy

Deadline Buddy is a simple academic deadline tracker for Grade 11 and Grade 12 students. It helps users create a local account, save subjects, school requirements, due dates, reminders, and checklist steps.

## How To Open

This version is a static website. It does not need XAMPP, PHP, MySQL, Node.js, or a server.

Open this file in a browser:

```text
index.html
```

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

Because this is a browser-only project, there is no online database. Accounts and records are saved locally in the browser. To move records to another laptop or browser, use the saved-records feature on the Profile page.
