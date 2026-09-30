# Deadline Buddy Simple Demo Guide

Use this guide when presenting Deadline Buddy to someone who has never used the system before.

## Simple Explanation

Deadline Buddy is a student helper app for Grade 11 and Grade 12 students. It helps students organize school requirements, subjects, deadlines, reminders, and checklist steps.

The app helps students see:

- tasks they still need to finish
- tasks that are almost due
- tasks that are already late
- the subject connected to each requirement
- smaller steps needed to finish a big requirement
- reminders before a deadline

## Before The Demo

Open the project folder, then open this file in a browser:

```text
index.html
```

This version does not need XAMPP, MySQL, or an online database. It runs directly in the browser.

The records are saved inside the browser on the same laptop. If the student uses another laptop or browser, they should use the saved-records buttons on the Student Profile page.

## Demo Script

### 1. Start The App

Open `index.html`.

Say:

> This is the login and sign-up page of Deadline Buddy. A student can create an account, choose Grade 11 or Grade 12, and log in using a username and password.

Show the two tabs:

- Log In
- Sign Up

Create a sample account:

```text
Name: Andrea Santos
Username: andrea12
Password: 1234
Grade Level: Grade 12
Strand / Track: ASSH
```

Mention:

> The Remember my login option saves the login on this browser, so the student does not need to type it again next time.

After signing up or logging in, open the dashboard.

### 2. Show The Dashboard

Say:

> The dashboard shows a quick summary of the student's school requirements. It shows how many tasks are saved, how many are completed, which tasks are late, and which deadline needs attention first.

Point out:

- Total Requirements
- Due Today
- Overdue
- Completed
- Priority Requirement Focus
- Upcoming Academic Tasks

Say:

> The app automatically highlights the most urgent requirement so the student knows what to focus on first.

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

Say:

> Adding subjects helps the student group requirements properly.

### 4. Add A Requirement

Open the Add Requirement page.

Say:

> This is where the student adds assignments, performance tasks, projects, quizzes, research work, and other school requirements.

Add a sample requirement:

```text
Title: Research Chapter 2 Draft
Subject: Practical Research 2
Category: Research Requirement
Due Date: Tomorrow or a few minutes from now
Priority: High
```

Point out the reminder preview below the date and time field.

Say:

> The app shows when the deadline is due and when reminders will happen, including 1 day before and 20 minutes before the deadline.

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

> This page shows all saved requirements. The student can search, filter, and mark tasks as done.

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

Say:

> When a task is marked as done, the status updates automatically.

### 6. Show Reminders And Alerts

Open Reminders & Alerts.

Say:

> This page helps the student see which tasks are overdue, due today, due tomorrow, or coming soon.

Explain:

- If a task is 1 day before the deadline, the app shows a reminder.
- If a task is 20 minutes before the deadline, the app shows a stronger reminder.
- If a task is past the deadline, the app marks it as overdue.

Say:

> The notification bell shows how many deadline alerts need attention.

Important:

> The app must be open in the browser for live pop-up reminders and sounds to appear.

### 7. Show The Calendar

Open the Calendar page.

Say:

> The calendar shows deadlines by date so the student can see busy days and prepare early.

Point out:

- colored deadline labels
- current date highlight
- smooth calendar effects
- responsive mobile calendar layout
- floating add button on mobile view

Say:

> On phones, the calendar adjusts to different screen sizes such as Android phones and iPhones.

### 8. Show Student Profile And Saved Records

Open Student Profile.

Say:

> This page saves the student's profile information. It also lets the student keep a copy of their saved Deadline Buddy records.

Show that Grade Level can be:

- Grade 11
- Grade 12

Explain the buttons:

```text
Download My Saved Records
```

This saves a copy of the student's profile, subjects, tasks, checklist steps, and reminders to the laptop.

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

Login and sign-up page. Students can create a local account, choose Grade 11 or Grade 12, and log in.

```text
dashboard.html
```

Main summary page. Shows important counts, urgent requirements, and upcoming tasks.

```text
tasks.html
```

List of all school requirements. Used for searching, filtering, viewing, editing, and marking tasks as done.

```text
task-form.html
```

Form for adding or editing a requirement. Includes due date, time, priority, and checklist steps.

```text
task-details.html
```

Full view of one requirement, including deadline details and checklist steps.

```text
subjects.html
```

Page for adding and managing subjects, teacher names, and schedules.

```text
calendar.html
```

Monthly calendar view of deadlines. It is responsive for desktop and mobile screens.

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

> Deadline Buddy is a simple deadline tracker for Grade 11 and Grade 12 students. It helps students create an account, save subjects, list school requirements, set due dates, add checklist steps, and receive reminders before deadlines. It is designed to help students avoid forgetting schoolwork and manage their tasks more clearly.

## Important Notes

- The app can run by opening `index.html`.
- It does not need XAMPP or MySQL.
- Login accounts and school records are saved in the browser on the same laptop.
- The Remember my login option only works on the same browser.
- To move records to another laptop or browser, use Download My Saved Records first.
- Live reminder pop-ups work while the app is open in the browser.
- Desktop and mobile layouts are supported.
