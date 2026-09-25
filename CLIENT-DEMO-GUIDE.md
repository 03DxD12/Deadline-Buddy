# Deadline Buddy Simple Demo Guide

Use this guide when presenting Deadline Buddy to someone who has never used the system before.

## Simple Explanation

Deadline Buddy is a student helper app. It helps a Grade 12 student list school requirements, set deadlines, track subjects, and see reminders before a task is due.

The app is useful because students can quickly see:

- what tasks they still need to finish
- which tasks are almost due
- which tasks are already late
- what subject each requirement belongs to
- the smaller steps needed to finish a requirement

## Before The Demo

Open the project folder, then open this file in a browser:

```text
index.html
```

You do not need XAMPP, MySQL, or an online database for this version. The records are saved inside the browser on the same laptop.

## Demo Script

### 1. Start The App

Open `index.html`.

Say:

> This is the opening page of Deadline Buddy. The student can enter their name and start using the app.

Enter a sample student name, then continue to the dashboard.

### 2. Show The Dashboard

Go to the dashboard.

Say:

> The dashboard shows a quick summary of the student's school requirements. It shows how many tasks are saved, how many are completed, which ones are late, and which deadline needs attention first.

Point to the most urgent task and the upcoming tasks.

### 3. Show Subjects

Open the Subjects page.

Say:

> This page is where the student saves their subjects. Each subject can have a teacher name and class schedule so requirements are easier to organize.

Add a sample subject, such as:

```text
Subject: Practical Research 2
Teacher: Mr. Ramos
Schedule: TTH 1:00 PM
```

### 4. Add A Requirement

Open the Add Requirement page.

Say:

> This is where the student adds a school requirement, such as an assignment, performance task, project, or research work.

Add a sample requirement:

```text
Title: Research Chapter 2 Draft
Subject: Practical Research 2
Category: Research Requirement
Due Date: Tomorrow or a few minutes from now
```

Add checklist steps:

```text
Gather survey data
Write methodology
Review grammar
Submit final draft
```

Say:

> The checklist helps the student break a big requirement into smaller steps.

### 5. Show The Tasks Page

Open Tasks & Requirements.

Say:

> This page shows all saved requirements. The student can search, filter, and mark tasks as done.

Show:

- All tasks
- Pending tasks
- Completed tasks
- Urgent tasks
- Search bar
- Done button

Say:

> When a task is marked as done, the status changes automatically.

### 6. Show Reminders And Alerts

Open Reminders & Alerts.

Say:

> This page helps the student see which tasks are late, due today, due tomorrow, or coming soon.

Explain the alert behavior:

- If a task is 1 day before the deadline, the app shows a reminder.
- If a task is 20 minutes before the deadline, the app shows a stronger reminder.
- If a task is already past the deadline, the app marks it as overdue.

Say:

> The notification bell at the top shows how many deadline alerts need attention.

Important note:

> The app must be open in the browser for the live reminder popup and sound to appear.

### 7. Show The Calendar

Open the Calendar page.

Say:

> The calendar shows deadlines by date. This helps the student see busy days and prepare ahead of time.

Click a date with a deadline if available.

### 8. Show Student Profile And Saved Records

Open Student Profile.

Say:

> This page saves the student's profile information. It also has buttons for keeping a copy of the student's saved records.

Explain the buttons:

```text
Download My Saved Records
```

This saves a copy of the student's tasks, subjects, profile, and reminders to the laptop.

```text
Bring Back My Saved Records
```

This brings the saved records back into the app, especially if the student uses another browser or laptop.

```text
Bring Back Sample Records
```

This resets the app to sample Grade 12 ASSH records for practice or presentation.

Say:

> These buttons are useful because this version saves records in the browser, not in an online account.

## Simple Page Guide

```text
index.html
```

Opening page where the student starts the app.

```text
dashboard.html
```

Main summary page. Shows important counts and urgent requirements.

```text
tasks.html
```

List of all school requirements. Used for searching, filtering, and marking tasks as done.

```text
task-form.html
```

Form for adding or editing a requirement.

```text
task-details.html
```

Full view of one requirement, including deadline details and checklist steps.

```text
subjects.html
```

Page for adding and managing subjects.

```text
calendar.html
```

Monthly calendar view of deadlines.

```text
reminders.html
```

Page for deadline alerts and reminder history.

```text
profile.html
```

Student profile page and saved-records tools.

## Short Client Explanation

You can say this during the presentation:

> Deadline Buddy is a simple deadline tracker for Grade 12 students. It helps students save subjects, list school requirements, set due dates, add checklist steps, and get reminders before deadlines. It is designed to help students avoid forgetting tasks and manage schoolwork more clearly.

## Important Notes

- The app can run by opening `index.html`.
- It does not need XAMPP or MySQL.
- Records are saved in the browser on the same laptop.
- To move records to another laptop or browser, use Download My Saved Records first.
- Live reminder popups work while the app is open in the browser.
