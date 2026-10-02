# Deadline Buddy Simple Demo Guide

Use this guide when presenting Deadline Buddy to someone who has never used the system before.

## Simple Explanation

Deadline Buddy is a student helper app for Grade 11 and Grade 12 students. It helps students organize school requirements, subjects, deadlines, reminders, and checklist steps.

It helps students see:

- tasks they still need to finish
- tasks that are almost due
- tasks that are already late
- the subject connected to each requirement
- smaller steps needed to finish a big requirement
- reminders before a deadline

## Important Version Explanation

There are two versions:

- **Website version** - good for normal browser use and presentation.
- **Windows app version** - needed for real offline reminders when the main screen is closed.

Say this clearly:

> The website version can show reminders while it is open. The Windows app version is the one designed to keep reminders active even when the main Deadline Buddy screen is closed.

## Before The Demo

For browser demo:

```text
Open index.html
```

For Windows offline reminder demo:

```text
Open Deadline Buddy using the Electron/Windows app version
```

The app does not need XAMPP, MySQL, PHP, or an online database.

## Demo Script

### 1. Start The App

Open `index.html` or the Windows app.

Say:

> This is the login and sign-up page of Deadline Buddy. A student can create an account, choose Grade 11 or Grade 12, and log in using a username and password.

Create a sample account:

```text
Name: Andrea Santos
Username: andrea12
Password: 1234
Grade Level: Grade 12
Strand / Track: ASSH
```

### 2. Show The Dashboard

Say:

> The dashboard gives a quick summary of the student's requirements. It shows total tasks, tasks due today, overdue tasks, completed tasks, and the most urgent requirement.

Point out:

- Total Requirements
- Due Today
- Overdue
- Completed
- Priority Requirement Focus
- Upcoming Academic Tasks

### 3. Show Subjects

Open the Subjects page.

Say:

> This page is where the student saves their subjects, teacher names, and class schedules.

Add a sample subject:

```text
Subject: Practical Research 2
Teacher: Mr. Ramos
Schedule: TTH 1:00 PM
```

### 4. Add A Requirement

Open Add Requirement.

Say:

> This is where the student adds assignments, projects, quizzes, exams, research work, and other school requirements.

Example:

```text
Title: Research Chapter 2 Draft
Subject: Practical Research 2
Category: Research Requirement
Due Date: A few minutes from now for demo
Priority: Hard
```

Add checklist steps:

```text
Gather survey data
Write methodology
Review grammar
Submit final draft
```

Say:

> The checklist helps the student divide a big requirement into smaller steps.

### 5. Show Tasks And Requirements

Open Tasks & Requirements.

Say:

> This page shows all saved requirements. The student can search, filter, view details, edit tasks, and mark tasks as done.

Show:

- All tasks
- Pending tasks
- In Progress tasks
- Completed tasks
- Urgent / Overdue tasks
- Search bar
- Details button
- Edit button
- Done button

### 6. Show Reminders And Alerts

Open Reminders & Alerts.

Say:

> This page groups requirements by urgency, such as overdue, due today, due tomorrow, and coming soon.

Explain:

- 1 day before means the deadline is near.
- 1 hour before means the student should focus soon.
- 20 minutes before means the deadline is urgent.
- Overdue means the deadline already passed.

Say:

> The notification bell shows how many deadline alerts need attention.

For Windows app demo, click:

```text
Send Test Notification
```

Say:

> In the Windows app version, Deadline Buddy can stay in the system tray and continue checking reminders after the main screen is closed.

### 7. Show The Calendar

Open Calendar.

Say:

> The calendar shows deadlines by date so the student can see busy days and prepare early.

Point out:

- current date highlight
- deadline labels
- previous and next month controls
- responsive phone layout

### 8. Show Student Profile

Open Student Profile.

Say:

> This page saves the student's profile information, theme, and saved-record tools.

Explain:

```text
Download My Saved Records
```

This saves a copy of the student's records.

```text
Bring Back My Saved Records
```

This restores saved records.

```text
Bring Back Sample Records
```

This clears current demo records and brings back sample records.

## Offline Reminder Demo For Windows App

Use this only when testing the packaged Windows/Electron version.

1. Create a task due 2 minutes from now.
2. Save the task.
3. Go to Reminders and click Send Test Notification.
4. Turn Wi-Fi off.
5. Close the main Deadline Buddy window.
6. Confirm Deadline Buddy stays in the system tray.
7. Wait for the reminder.
8. A Windows notification should appear.

Important:

> If the laptop is completely powered off, no notification can appear at that exact time.

## Short Client Explanation

> Deadline Buddy is a simple deadline tracker for Grade 11 and Grade 12 students. It helps students save subjects, list school requirements, set due dates, add checklist steps, and receive reminders before deadlines. The Windows app version is designed for offline reminders even when the main screen is closed.
