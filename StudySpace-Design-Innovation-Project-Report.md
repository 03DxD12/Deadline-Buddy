# Deadline Buddy: A Student-Centered System for Tracking and Achieving Academic Deadlines

**Course / Subject:** Design and Innovation  
**Academic Year:** 2026–2027  
**Term:** Term 2  
**Instructor:** Ma. Danealla Ortiz  
**Section:** OCI 1  
**Institution:** Olinsterg College Inc.  
**Track & Level:** Senior High School (Grade 11 & Grade 12 — ASSH Academic Track)  

**Design & Innovation Team Members:**
- Denmhar Dimaculangan (Lead Developer & System Architect)
- Andrea Santos (UX / UI & Student Research Lead)
- Christian Reyes (Technical Documentation & Testing Lead)
- Ma. Sofia Ramirez (Quality Assurance & Requirements Analyst)

---

## TABLE OF CONTENTS

- **Title Page**
- **Project Overview**
- **Project Objectives**
- **Chapter 1: Understanding the Problem**
  - 1.1 Background of the Problem
  - 1.2 Area of Concern
  - 1.3 Initial Problem Statement
  - 1.4 Users and Stakeholders
- **Chapter 2: Listening to Users and Understanding Contexts**
  - 2.1 Inquiry Methods
  - 2.2 Sample Survey Questions
  - 2.3 Sample User Responses
  - 2.4 Initial Observations
  - 2.5 Ethical Considerations
- **Chapter 3: Sense-Making and Problem Framing**
  - 3.1 User Data Analysis & Key Patterns
  - 3.2 Empathy Map (Says, Thinks, Does, Feels)
  - 3.3 Rose-Thorn-Bud Analysis
  - 3.4 Key Insights
  - 3.5 Final Design Challenge (How Might We)
- **Chapter 4: Co-Design and Ideation**
  - 4.1 Initial Ideas
  - 4.2 SCAMPER Activity Matrix
  - 4.3 Idea Selection Criteria
  - 4.4 Idea Selection Matrix & Scoring
  - 4.5 Selected Solution Architecture: Deadline Buddy
- **Chapter 5: Making Ideas Testable (Prototyping)**
  - 5.1 Prototype Description
  - 5.2 Prototype Assumptions & Hypotheses
  - 5.3 Prototype Materials and Technologies
  - 5.4 Prototype Development Process
  - 5.5 Prototype Screen Documentation & Interaction Flow
- **Chapter 6: User Testing and Feedback**
  - 6.1 Testing Participants & Setup
  - 6.2 Testing Questions & Usability Protocol
  - 6.3 Positive Feedback & Critical Concerns
- **Chapter 7: Evaluation and Design Decisions**
  - 7.1 Feedback Analysis (Keep, Change, Remove)
  - 7.2 Design Trade-Offs & Compromise Analysis
  - 7.3 Iterative Prototype Revisions
- **Chapter 8: Final Solution & Specifications**
  - 8.1 System Overview: Deadline Buddy
  - 8.2 Core Functional Modules (16 Essential Modules)
  - 8.3 Ethical, Social, and Environmental Considerations
  - 8.4 Universal Accessibility, Typography, and Touch Design
- **Chapter 9: Evaluation and Reflection**
  - 9.1 Key Pedagogical Learnings
  - 9.2 What Worked Well
  - 9.3 What Did Not Work and Required Re-engineering
  - 9.4 How User Feedback Addressed Core Deficiencies
  - 9.5 Practical Project Limitations
- **Chapter 10: Conclusion and Recommendations**
  - 10.1 Conclusion
  - 10.2 Strategic Recommendations for Scale
- **References (APA 7th Edition)**
- **Appendices (A through N)**

---

## PROJECT OVERVIEW

Senior High School students face an intensive curriculum characterized by concurrent academic demands across core, applied, and specialized subjects. On any given week, learners in Grade 11 and Grade 12 must juggle research paper drafts, STEM problem sets, performance tasks, group projects, and periodic examinations. However, critical requirement information is frequently fragmented across notebooks, physical whiteboards, social media chat groups (e.g., Facebook Messenger), and learning management systems. Consequently, students routinely experience cognitive overload, task paralysis, and missed deadlines.

**Deadline Buddy** is a student-centered academic planning and deadline management system designed to restore student control over their academic workload. Grounded in the **Human-Centered Design (HCD)** philosophy and the five phases of the **Design Thinking** framework (*Empathize, Define, Ideate, Prototype, Test*), Deadline Buddy centralizes subjects, daily meeting schedules, requirement due dates, subtask checklists, and multi-stage advance reminders into a single, cohesive, offline-capable digital companion.

Architecturally, Deadline Buddy is implemented through a modern, lightweight, dual-mode platform:
1. **Installable Progressive Web App (PWA):** Accessible via standard web browsers across mobile phones and desktop laptops, featuring client-side caching through a Service Worker (`service-worker.js`) and dual-layer local persistence (`IndexedDB` and `localStorage`).
2. **Installed Android Mobile Application:** Packaged via **Capacitor** (`@capacitor/android`) and utilizing native device alarms (`@capacitor/local-notifications`). This allows scheduled deadline alerts to wake the device and trigger audible notifications even when the application process is completely closed, removed from the recent apps switcher, the screen is locked, and internet connectivity is disconnected.

By deliberately eschewing battery-draining continuous background loops and eliminating heavyweight desktop dependencies, Deadline Buddy delivers a reliable, accessible, and privacy-respecting academic tool that ensures students never miss an important school submission.

---

## PROJECT OBJECTIVES

Throughout this design innovation project, the student engineering team established and achieved the following core objectives:

1. **Investigate** the real-world organizational bottlenecks, stress triggers, and deadline tracking habits experienced by Grade 11 and Grade 12 Senior High School students.
2. **Apply** human-centered inquiry methods—including semi-structured interviews, academic workflow mapping, and survey instruments—while upholding strict ethical and data privacy standards.
3. **Map** direct and indirect educational stakeholders (students, subject teachers, academic advisers, parents, and school guidance personnel) to understand conflicting operational constraints.
4. **Synthesize** empirical user research into actionable Design Thinking models: User Personas, Empathy Maps, Behavioral Pattern Hierarchies, and Rose-Thorn-Bud taxonomies.
5. **Formulate** an actionable, human-centered "How Might We" (HMW) design challenge statement focused on student deadline management.
6. **Generate** and evaluate divergent solutions through structured ideation tools (SCAMPER, Brainwriting, and multi-criteria decision matrices).
7. **Architect** and build a functional, responsive, offline-first digital prototype incorporating semantic HTML5, Vanilla CSS design tokens, modern JavaScript (ES6+), and dual-mode delivery (PWA + Capacitor Android).
8. **Implement** an operating-system-level scheduled reminder engine using Android `AlarmManager` via Capacitor Local Notifications, calculating 4-stage advance alert intervals (24 hours, 1 hour, 20 minutes before deadline, and overdue) that function when the application is completely closed.
9. **Conduct** structured usability and task-performance walkthroughs with Senior High School students and educators.
10. **Analyze** user critiques through structured Keep / Change / Remove matrices to guide ergonomic and interface iterations.
11. **Refine** interface typography, color contrast, touch target sizing ($\ge 44\text{px}$), and responsive breakpoints to guarantee universal accessibility across budget smartphones and laptops.
12. **Incorporate** robust local data management features, including automated JSON backup and restore, zero-server privacy protection, and transparent permission workflows.
13. **Critique** the project's practical limitations, technical compromises, and long-term deployment viability within institutional academic workflows.

---

# CHAPTER 1: UNDERSTANDING THE PROBLEM

### 1.1 Background of the Problem
The Philippine Senior High School (SHS) curriculum under the K to 12 educational system presents high cognitive and organizational demands. Students in Grades 11 and 12 must complete an average of 8 to 9 subjects per academic semester, spanning specialized fields such as Practical Research 2, Inquiries, Investigations and Immersion (3Is), General Mathematics, Creative Writing, and Discipline and Ideas in the Social Sciences. Each subject demands distinct evaluative deliverables: formal thesis chapters, statistical problem sets, multimedia portfolios, laboratory logs, and summative quizzes.

In typical secondary school settings such as Olinsterg College Inc., assignment instructions and deadlines are communicated through disparate channels:
- Verbal announcements at the end of class periods;
- Handwritten blackboard notations copied hurriedly into student notebooks;
- Unofficial Facebook Messenger class group chats and Discord servers where critical deadlines become rapidly buried under hundreds of social messages;
- Digital classroom platforms that require continuous internet connectivity to access.

This lack of centralized synchronization forces students to rely heavily on fallible human memory or disorganized scratch notes. During peak academic periods (midterm and final evaluation weeks), requirements across separate subjects inevitably collide. Students frequently overlook tasks until hours or minutes before submission, precipitating severe anxiety, sleep deprivation, hurried sub-standard academic outputs, or unearned grade deductions.

### 1.2 Area of Concern
**Student Academic Organization and Deadline Management:** The cognitive load, digital fragmentation, prioritization failures, and memory decay experienced by secondary school learners when managing concurrent educational requirements.

### 1.3 Initial Problem Statement
> *"Senior High School students lack a centralized, accessible, and offline-capable academic planning system, leading to scattered deadline tracking, forgotten requirements, elevated stress, and last-minute academic compromises."*

### 1.4 Users and Stakeholders

#### Primary Users
- **Grade 11 and Grade 12 Senior High School Students:** Learners actively balancing 8–9 distinct subjects, modular projects, research defenses, and college entrance preparations. They require fast, low-friction task capture, instant visibility into daily schedules, and reliable advance reminders.

#### Secondary Users
- **Subject Teachers & Research Advisers:** Benefit directly when students submit outputs on time, properly structured, and with fewer requests for uncoordinated extensions.
- **Academic Track Coordinators:** Seek improved overall submission rates and reduced student failure frequencies.

#### Stakeholder Matrix

| Stakeholder Group | Primary Interest | Operational Constraints & Concerns |
| :--- | :--- | :--- |
| **Grade 11 & 12 Students** | Fast task logging, clear urgency indicators, reminders when app is closed, offline functionality | Limited cellular data budgets, low storage space on budget mobile phones |
| **Subject Teachers** | Timely and complete student submissions, reduced extension appeals | Reluctance to learn complex new teacher portals; prefer students manage their own deadlines |
| **School Administration** | Academic excellence, student retention, positive school climate | Strict student data privacy policies, zero budget for dedicated server hosting |
| **Parents & Guardians** | Reduced academic stress, healthy study-sleep balance at home | Distraction concerns regarding excessive smartphone screen time |
| **Guidance Office** | Mitigation of academic anxiety, burn-out prevention, inclusive learning | Ensuring tools empower student autonomy rather than fostering reliance or panic |

---

# CHAPTER 2: LISTENING TO USERS AND UNDERSTANDING CONTEXTS

### 2.1 Inquiry Methods
To develop an authentic, empathetic understanding of student workflows, the design team planned and conducted a multi-methodological field inquiry:
1. **Digital & Paper Questionnaire:** Administered to selected Grade 11 and Grade 12 students across the ASSH (Arts, Social Sciences, and Humanities), STEM, ABM, and TVL tracks.
2. **Semi-Structured *Kuwentuhan* Interviews:** Conducted in natural campus settings (cafeteria, library steps, and homerooms) exploring personal task tracking failures and memory lapse episodes.
3. **Artifact Analysis of Student Planners:** Reviewing actual student notebooks, planner apps, and smartphone screenshots to document existing organizational methods.
4. **Key Informant Dialogue:** Consultations with Senior High School faculty regarding common causes of late student submissions.

### 2.2 Survey Instrument Topics & Questions
The inquiry focused specifically on deadline tracking mechanics, digital habits, and reminder preferences:
1. *How do you currently record your school assignments, projects, and exam dates?* (Paper notebook / Notes app / Messenger chat saves / Rely on memory / Rely on classmates)
2. *How frequently do you forget or almost forget a school deadline?* (Multiple times a week / Once a week / Once a month / Rarely)
3. *What is the primary reason an academic deadline slips your mind?* (Lost in group chats / Too many simultaneous tasks / Forgot to write it down / Procrastination)
4. *When looking at your academic tasks, what information do you need to see first?* (The most urgent deadline / Today's classes / Checklist progress / Subject name)
5. *Would an automated display of "Today's Classes" and "Today's Deadlines" be useful to your daily routine?*
6. *How far in advance should an academic system alert you about an upcoming deadline?* (1 day before / 1 hour before / 20 minutes before / When overdue)
7. *Do you constantly have access to mobile data or school Wi-Fi while traveling or at home?*
8. *Would you prefer an application that continues working 100% offline without requiring internet access?*
9. *What prevents you from using commercial planner apps (e.g., Notion, Todoist, Google Calendar)?* (Too complicated / Requires internet / Too slow / Full of ads / Too many irrelevant features)

### 2.3 Sample User Responses (Qualitative Voices)
Direct student testimonies highlighted consistent friction points:
- *"Nasa Messenger group chat lahat ng announcements. Minsan may 500 unread messages tungkol sa chika o laro, kaya natatabunan yung homework sa Practical Research. Nalalaman ko na lang na may pasahan pag may nag-submit na sa classroom."* — (Grade 12 ASSH Student)
- *"Gumagamit ako ng notes app sa phone, pero nakakatamad mag-type kasi kailangan ko pang mag-isip ng tags. Kapag tambak ang requirements, hindi ko na alam kung alin ang dapat unahin: yung essay ba o yung math problem set."* — (Grade 11 STEM Student)
- *"Minsan alam kong may deadline bukas ng 11:59 PM, pero dahil walang reminder na tumutunog sa phone ko kapag naka-lock ang screen, nalilimutan ko hanggang sa makatulog ako."* — (Grade 12 ABM Student)
- *"Wala kaming Wi-Fi sa bahay kapag brownout o kapag naubusan ng load. Yung mga online task apps nagha-hang o hindi naglo-load kapag walang internet."* — (Grade 12 TVL Student)
- *"Gusto ko simple lang: ano ang schedule ko ngayong araw, ano ang kailangang ipasa bago mag-gabi, at tutunog sa phone ko kahit naka-off ang app."* — (Grade 11 HUMSS Student)

### 2.4 Initial Observations & Findings
- **High Friction in Generic Apps:** Mainstream productivity apps (Notion, Trello, Asana) were overwhelmingly viewed by Senior High School students as "too heavy," "overwhelming," and "excessively complicated" for simple daily homework tracking.
- **The "Group Chat Quagmire":** Social media messaging apps serve as the default announcement conduit, but their non-chronological conversational format directly undermines accountability.
- **Lack of Multi-Stage Alerting:** Standard alarms only trigger once, easily dismissed or ignored. Students expressed the need for escalating urgency thresholds (e.g., 24 hours, 1 hour, and an urgent 20-minute warning).
- **Data Budget Constraints:** High school learners frequently operate with intermittent prepaid mobile data, making cloud-dependent web applications unreliable during commutes and at home.

### 2.5 Ethical Considerations & Research Protocols
- **Informed Student Consent:** Participants were explicitly informed regarding the academic purpose of the study. Participation was entirely voluntary with zero bearing on academic standings.
- **Anonymity & Privacy:** No student identification numbers, full names, or confidential grades were recorded or published.
- **Transparency:** Participants were assured that their candid feedback regarding school assignments and teacher pacing would remain strictly confidential.

---

# CHAPTER 3: SENSE-MAKING AND PROBLEM FRAMING

### 3.1 User Data Analysis & Key Patterns

```
┌────────────────────────────────────────────────────────────────────────┐
│                   STUDENT DATA SYNTHESIS & THEMES                      │
└───────────────────────────────────┬────────────────────────────────────┘
                                    │
        ┌───────────────────────────┼───────────────────────────┐
        ▼                           ▼                           ▼
[Fragmented Channels]      [Prioritization Fog]        [Connectivity Gaps]
Deadlines buried across    Students struggle to        Apps failing without
Messenger chats, scratch   differentiate between       internet alienate
notebooks, and memory.     imminent vs distant tasks.  budget-conscious youth.
```

The team distilled the user research findings into six structural behavioral patterns:
- **Pattern 1: Deadline Awareness Breakdown:** Students know they have work, but lose track of precise submission hours (e.g., distinguishing 5:00 PM school drop-off from 11:59 PM portal deadlines).
- **Pattern 2: Academic Task Organization Deficits:** Homework is recorded without metadata (subject, teacher, priority), leading to ambiguous task lists.
- **Pattern 3: Prioritization Paralysis:** Faced with 5 concurrent assignments, students default to low-effort tasks rather than imminent deadlines due to lack of dynamic urgency sorting.
- **Pattern 4: Proactive Reminder Needs:** Reminders must push outward to the student; expecting students to actively remember to open an app daily fails.
- **Pattern 5: Large Task Management Hurdles:** Large-scale deliverables (e.g., Capstone Chapters) feel insurmountable without modular checklist breakdowns.
- **Pattern 6: Offline Accessibility Mandate:** An academic planner that fails when Wi-Fi is unavailable is unusable during the daily transit of Filipino commuting students.

### 3.2 Empathy Map

| Quadrant | Student Reality & Experience |
| :--- | :--- |
| **SAYS** | • *"May pasahan ba tayo bukas?"*<br>• *"Hindi ko alam kung anong uunahin ko sa dami ng kailangang gawin."*<br>• *"Bakit ngayon niyo lang sinabi na may quiz pala kanina?"*<br>• *"Sana may app na diretso sasabihin kung ano ang due today."* |
| **THINKS** | • *"Baka may nakalimutan akong requirement na magpapababa ng grade ko."*<br>• *"Gusto ko nang matulog pero natatakot ako na baka may deadline bukas ng umaga."*<br>• *"Sana madaling tingnan lahat ng assignments sa iisang screen nang hindi naglo-load nang matagal."* |
| **DOES** | • Scours Messenger group chats back to 3 days prior.<br>• Scribbles deadlines on the back pages of separate subject notebooks.<br>• Asks classmates late at night for submission guidelines.<br>• Sets crude smartphone alarms that lack subject titles and context. |
| **FEELS** | • Overwhelmed and paralyzed when multiple subject deadlines coincide.<br>• Constant underlying anxiety regarding unseen or forgotten requirements.<br>• Greatly relieved and motivated when tasks are organized into clear, actionable steps. |

### 3.3 Rose-Thorn-Bud Analysis

| Category | Educational & Behavioral Observations |
| :--- | :--- |
| **ROSE**<br>*(Existing strengths & positive practices)* | • Students universally possess smartphones or have access to web browsers.<br>• Students actively attempt to write task lists and maintain notebooks.<br>• Students readily collaborate to remind peers about major school events.<br>• Senior High School students demonstrate high digital literacy with modern mobile interfaces. |
| **THORN**<br>*(Pain points, risks & bottlenecks)* | • Assignment notices are scattered across multiple digital and physical locations.<br>• Existing productivity apps require constant internet access and complex account setup.<br>• Generic to-do apps do not link requirements to subject class meeting schedules.<br>• Single-event reminders fail if dismissed, leading to missed deadlines.<br>• Commercial apps push advertisements or lock offline features behind paywalls. |
| **BUD**<br>*(Opportunities for design innovation)* | • Design an offline-first architecture storing data directly on the student's device.<br>• Automatically compute urgency tiers (*Urgent*, *Due Today*, *Due Soon*, *Upcoming*, *Overdue*).<br>• Combine class schedules with task tracking to populate dynamic "Today's Classes" and "Today's Deadlines".<br>• Schedule operating-system-level alarms that execute even when the application is completely closed.<br>• Provide modular step-by-step checklists inside each requirement card. |

### 3.4 Key Insights
1. **Simplicity Trumps Complex Feature Sets:** Students do not need Gantt charts, Kanban boards, or markdown formula editors; they need to know what is due today, what is due tomorrow, and what time it must be submitted.
2. **Context Matters (Subject + Schedule):** Deadlines cannot be detached from subject schedules. A student needs to know that Practical Research meets on MWF 9:00 AM to properly contextualize when an assignment will be collected.
3. **Escalating Reminders are Essential:** A single alarm set 1 day prior does not account for the rush 1 hour or 20 minutes before submission. Multi-stage scheduling mirrors real student time-management psychology.

### 3.5 Final Design Challenge Statement
> **"How might we create an accessible, offline-first, and easy-to-use academic planning system that helps Senior High School students organize subject requirements, identify urgent deadlines, and receive reliable native reminders even when the application is closed?"**

---

# CHAPTER 4: CO-DESIGN AND IDEATION

### 4.1 Initial Concepts Generated
Through structured brainstorming and brainwriting sessions, the team developed six initial solution concepts:

- **Idea 1: Physical Paper Academic Planner Journal:** A customized print planner with daily blocks and habit trackers. (*Rejected:* Cannot send dynamic audio reminders; easily lost or left at home; recurring printing cost).
- **Idea 2: Basic Browser-Only To-Do List:** A generic webpage utilizing local storage. (*Rejected:* Lacks native mobile feel; cannot trigger background notifications once the browser tab is closed).
- **Idea 3: Social Media Reminder Bot (Messenger/Telegram):** An automated bot sending messages into group chats. (*Rejected:* Requires active internet connection; subject to platform API changes and server downtime; message flooding).
- **Idea 4: Heavyweight Windows Desktop Application (Electron):** A PC software running in the system tray. (*Rejected:* Excludes students who exclusively use smartphones; high memory footprint; cannot assist students while commuting).
- **Idea 5: Cloud-Hosted Multi-User Web Portal:** An online academic management system with centralized databases. (*Rejected:* Requires paid monthly server hosting; useless for students without active internet data; privacy risks).
- **Idea 6: Dual-Architecture Deadline Buddy (PWA + Capacitor Android Native Alarms):** A universal web app installable on any device, combined with a Capacitor Android package that interfaces directly with native operating system alarms (`AlarmManager`). (*Selected Solution*).

### 4.2 SCAMPER Activity Matrix

| SCAMPER Lens | Applied Software Innovation in Deadline Buddy |
| :--- | :--- |
| **S — Substitute** | Substitute paper notebooks and passive chat logs with dynamic digital cards that calculate live countdown timers. |
| **C — Combine** | Combine Subject Schedules, Academic Requirements, Task Checklists, Monthly Calendars, and Alarm Reminders into one unified dashboard. |
| **A — Adapt** | Adapt the interface aesthetics using the curated *Happy Hues* palette (Coral Pink, Warm Cream, Deep Charcoal) specifically tailored for youth appeal and reduced eye strain. |
| **M — Modify / Magnify**| Magnify deadline urgency by color-coding status badges (Red for Overdue, Orange for Urgent, Green for Completed) and providing live minute-by-minute countdowns. |
| **P — Put to Another Use** | Put the monthly calendar view to use not just as a date display, but as an interactive visual deadline density map. |
| **E — Eliminate** | Eliminate complicated project management clutter (no story points, no billable hours, no mandatory cloud accounts) to maximize student onboarding speed. |
| **R — Rearrange** | Rearrange the dashboard hierarchy so that "Today's Classes" and "Today's Deadlines" appear at the absolute top, addressing the student's immediate daily needs. |

### 4.3 Idea Selection Criteria
To rigorously evaluate candidate concepts, the team established six weighted criteria reflective of student constraints:
1. **Student Relevance (20%):** Direct alignment with SHS academic routines and pain points.
2. **Deadline & Urgency Management (20%):** Capacity to categorize and prioritize tasks by due date.
3. **Proactive Reminder Reliability (20%):** Ability to alert the user even when the app is closed.
4. **Offline Accessibility (15%):** Functionality without cellular data or Wi-Fi.
5. **Ease of Use & Low Friction (15%):** Intuitive, fast logging requiring minimal learning curve.
6. **Cross-Platform Viability (10%):** Availability on smartphones and laptops.

### 4.4 Idea Selection Matrix & Scoring

| Evaluation Criteria | Weight | Concept 1: Paper Planner | Concept 2: Basic To-Do | Concept 4: Desktop PC App | Concept 6: Deadline Buddy (PWA + Mobile) |
| :--- | :---: | :---: | :---: | :---: | :---: |
| **Student Relevance** | 20% | 15 / 20 | 14 / 20 | 12 / 20 | **19 / 20** |
| **Deadline Management** | 20% | 12 / 20 | 13 / 20 | 16 / 20 | **20 / 20** |
| **Reminder Reliability** | 20% | 0 / 20 | 6 / 20 | 14 / 20 | **19 / 20** |
| **Offline Accessibility** | 15% | 15 / 15 | 8 / 15 | 12 / 15 | **15 / 15** |
| **Ease of Use** | 15% | 12 / 15 | 13 / 15 | 9 / 15 | **14 / 15** |
| **Cross-Platform Viability**| 10% | 4 / 10 | 7 / 10 | 4 / 10 | **10 / 10** |
| **TOTAL WEIGHTED SCORE** | **100%** | **58 / 100** | **61 / 100** | **67 / 100** | **97 / 100** |

### 4.5 Selected Solution Architecture: Deadline Buddy
Concept 6 emerged as the clear winner. By implementing an **Offline-First PWA** packaged with **Capacitor Android native alarm scheduling**, Deadline Buddy guarantees:
- **Zero Hosting Dependencies:** All data resides in `localStorage` and `IndexedDB` on the student's phone.
- **Closed-App Notifications:** Alarms are registered with the Android operating system (`AlarmManager`), firing reliably even when the app is swiped away from memory or the phone is asleep.
- **Universal Accessibility:** Students with laptops can run it directly in Chrome or Edge, while students with Android smartphones enjoy native mobile notifications.

---

# CHAPTER 5: MAKING IDEAS TESTABLE (PROTOTYPING)

### 5.1 Prototype Description
The **Deadline Buddy Prototype** is an interactive, fully responsive, and offline-capable software application. It simulates the complete student life cycle: authentication, class schedule setup, task logging with multi-interval reminders, checklist tracking, calendar visualization, and data backup.

### 5.2 Prototype Assumptions & Hypotheses
- **Hypothesis 1 (Usability):** High school students can navigate the system and create a complete requirement with checklist steps in under 60 seconds without instruction.
- **Hypothesis 2 (Prioritization):** Presenting "Today's Classes" and "Today's Deadlines" prominently on the dashboard reduces perceived cognitive anxiety during peak school weeks.
- **Hypothesis 3 (Technical Feasibility):** Scheduling alarms with Android's native `AlarmManager` eliminates battery drain while achieving 100% notification delivery accuracy when the phone is locked.

### 5.3 Prototype Materials and Technologies
Unlike physical prototypes fabricated from cardboard or foam, Deadline Buddy was engineered utilizing industry-standard software technologies:

| Layer | Technology | Operational Purpose in Prototype |
| :--- | :--- | :--- |
| **Structure** | Semantic HTML5 | Clean document hierarchy (`<header>`, `<main>`, `<nav>`, `<section>`, `<article>`) ensuring screen-reader and search accessibility. |
| **Styling** | Vanilla CSS3 (Custom Design System) | Modern responsive design, CSS Grid, Flexbox, custom design tokens, dark/light theme switching, and touch-optimized micro-animations. |
| **Logic & State** | Modern JavaScript (ES6+) | Real-time date arithmetic, urgency threshold sorting, countdown timer ticks, and DOM manipulation without heavy external frameworks. |
| **Offline Storage**| `localStorage` + `IndexedDB` | Dual-layer client-side storage engine guaranteeing instantaneous data persistence with zero network requests. |
| **PWA Engine** | Service Worker (`service-worker.js`) | Pre-caches application shell (HTML, CSS, JS, SVG assets, and WOFF2 webfonts) enabling offline launches. |
| **Native Mobile** | Capacitor CLI & Core (`@capacitor/android`) | Bridges the web interface into a compiled native Android project with direct hardware API access. |
| **Native Alarms** | `@capacitor/local-notifications` | Native Android plugin that hooks directly into the Android `AlarmManager` to schedule exact deadline alarms. |

### 5.4 Prototype Development Process
1. **Low-Fidelity Wireframing:** Paper sketches outlining the dashboard hierarchy, mobile navigation bar, and split-card login layout.
2. **Medium-Fidelity Web Prototyping:** Implementation of the complete HTML/CSS design system with mock JSON data arrays.
3. **Logic & Data Layer Integration:** Writing `storage.js` and `deadline.js` to enable dynamic CRUD operations and urgency calculations.
4. **Android Native Bridging:** Initializing Capacitor via `npx cap add android`, configuring `AndroidManifest.xml` with exact alarm and reboot permissions, and developing `local-notifications.js`.
5. **Mobile Touch & Viewport Optimization:** Refining media queries for compact phone screens, ensuring no cutoffs or redundant graphics.

### 5.5 Prototype Screen Documentation & Interaction Flow

```
Student opens App / Web Link
             ↓
       [ index.html ] ────► Log In / Sign Up / Forgot Password / Install PWA
             ↓
     [ dashboard.html ] ──► Today's Classes, Today's Deadlines, Urgent Focus
             ↓
  ┌──────────┼──────────────┬──────────────┬──────────────┐
  ▼          ▼              ▼              ▼              ▼
[subjects] [tasks]    [task-details]  [calendar]    [reminders]
  Manage    Browse     Checklist &     Visual        Alarms Hub &
Classes     Filters    Countdown       Dates         Settings
```

#### Core Documented Screens:
1. **`index.html` (Landing & Authentication):** Responsive split-card featuring smooth tab switching between Log In, Sign Up, and Forgot Password, plus a permanent "Install Deadline Buddy on this Device" button.
2. **`dashboard.html` (Academic Command Center):** Displays real-time summary statistics (Pending, Due Today, Overdue, Completed), a Priority Requirement spotlight with a live countdown timer, and dynamic cards for "Today's Classes" and "Today's Deadlines".
3. **`subjects.html` (Subject & Schedule Manager):** Interface for adding subjects with color tags, room locations, teacher names, and meeting patterns (e.g., MWF, TTH).
4. **`task-form.html` (Add / Edit Requirement):** Multi-field form for requirement title, subject selector, deadline date and time pickers, priority level, notes, and checklist item builder. Automatically schedules 4 native alarms upon saving.
5. **`task-details.html` (Requirement Deep-Dive):** In-depth view featuring subtask checkboxes with a dynamic progress bar, minute-by-minute countdown, urgency badges, and quick-complete actions.
6. **`calendar.html` (Monthly Deadline Calendar):** Interactive grid showing deadline counts per date with instant day-inspection panels.
7. **`reminders.html` (Reminders & Alerts Center):** Hub displaying Notification Status, Precise Alarms Status, Scheduled Alarms Count, categorized task columns (*Overdue*, *Due Today*, *Urgent*, *Upcoming*), and the **Send Test Notification** button.
8. **`profile.html` (Settings, Themes & Backup):** Student profile customization, Theme switcher (*Soft Coral Pink* vs. *Clean Blue*), reminder preference toggles, and JSON data backup/restore utilities.

---

# CHAPTER 6: USER TESTING AND FEEDBACK

### 6.1 Testing Participants & Setup
To validate the prototype's efficacy, the team conducted structured usability sessions involving:
- **10 Senior High School Students** (Grade 11 and Grade 12 students representing ASSH, STEM, and ABM tracks);
- **2 Senior High School Subject Teachers** (Practical Research and Mathematics faculty);
- **1 Academic Coordinator**.

Testing was conducted across diverse hardware: low-to-mid-range Android smartphones (real devices), desktop laptops (Google Chrome and Microsoft Edge), and emulated mobile viewports.

### 6.2 Testing Questions & Structured Usability Protocol
Participants were asked to perform five specific operational tasks while thinking aloud:
- **Task 1:** Create a new student account and log in.
- **Task 2:** Add a new subject (*Practical Research 2*, MWF 9:00 AM, Room 302).
- **Task 3:** Create an urgent requirement (*Chapter 2 Literature Review Draft*) due in 2 hours with 3 subtask checklist steps.
- **Task 4:** Inspect the Dashboard to verify that the task appears under "Today's Deadlines" and check off one checklist step.
- **Task 5:** Schedule a test reminder, close the application completely, and confirm receipt of the audio/visual alert.

Following the walkthrough, participants evaluated the system using structured prompts:
1. *Was the dashboard information easy to read and understand at first glance?*
2. *Did you encounter any confusion when adding a deadline date or time?*
3. *Were you able to identify which requirement was most urgent without reading the full description?*
4. *How helpful is the step-by-step checklist feature for large academic projects?*
5. *Did the notification arrive when the app was closed?*
6. *Would you install Deadline Buddy on your personal mobile phone for daily school use?*
7. *What feature should be improved, added, or simplified?*

### 6.3 Positive Feedback & Critical Concerns

#### Positive User Voices
- *"Sobrang laking tulong nung 'Today's Classes' at 'Today's Deadlines' sa dashboard. Pagkabukas ko pa lang ng phone sa umaga, alam ko na agad kung anong subjects ko ngayong araw at kung may kailangan akong ipasa bago mag-dismissal."* (Student Participant 3, Grade 12 ASSH)
- *"Ang ganda nung countdown timer sa priority task card. May sense of urgency kaya hindi ka tatamad-tamad mag-cramming."* (Student Participant 7, Grade 11 STEM)
- *"I appreciate that the app doesn't require my students to have an internet connection. Most of our research students lose mobile data at home, so an offline tracker ensures they don't have excuses for missing deadlines."* (Faculty Participant 1, Practical Research Teacher)
- *"Natutuwa ako sa checklist sa loob ng task. Hindi na nakakatakot yung malalaking projects kasi puwedeng isa-isahin."* (Student Participant 10, Grade 12 ABM)

#### Critical Concerns & Bottlenecks Identified
- **Mobile View Top Panel Overload:** In early iterations, the top pink artwork panel on `index.html` contained a duplicated mascot logo, forcing the login fields below the mobile screen fold and requiring excessive scrolling.
- **Notification Permissions Friction:** Some Android 13+ devices silently blocked notifications because the app did not explain *why* notification permissions were needed prior to triggering the system dialog.
- **Accidental Deletion Anxiety:** Users worried about accidentally deleting completed requirements without a confirmation or undo safeguard.
- **Date Picker Ambiguity:** Default browser date inputs displayed varying formats depending on device OS language settings, occasionally confusing students.

---

# CHAPTER 7: EVALUATION AND DESIGN DECISIONS

### 7.1 Feedback Analysis (Keep, Change, Remove)

```
┌────────────────────────────────────────────────────────────────────────┐
│                        KEEP / CHANGE / REMOVE MATRIX                   │
├─────────────────────┬──────────────────────────┬───────────────────────┤
│        KEEP         │          CHANGE          │        REMOVE         │
├─────────────────────┼──────────────────────────┼───────────────────────┤
│ • Happy Hues palette│ • Compact mobile header  │ • Electron desktop    │
│ • Offline storage   │   (hide duplicate logo)  │   packaging & .exe    │
│ • Multi-stage alerts│ • Native OS AlarmManager │ • Windows tray script │
│ • Today's Classes   │ • High-contrast badges   │ • Continuous loop     │
│ • Subtask checklist │ • 44px touch targets     │   background checks   │
│ • JSON backup tools │ • Plain-language settings│ • Complex Gantt charts│
└─────────────────────┴──────────────────────────┴───────────────────────┘
```

### 7.2 Design Trade-Offs & Compromise Analysis

1. **Feature Density vs. Interface Simplicity:**
   - *Tension:* Some students suggested adding grade calculators, GPA trackers, and chat features.
   - *Decision:* Rejected. Adding ancillary modules dilutes Deadline Buddy's core mission: frictionless deadline tracking. Simplicity preserves rapid loading times and prevents cognitive distraction.
2. **Offline Local Privacy vs. Cloud Synchronization:**
   - *Tension:* Storing data online allows multi-device syncing, but requires user accounts, continuous internet connectivity, and recurring hosting costs.
   - *Decision:* Chose an **Offline-First local architecture** (`localStorage` + `IndexedDB`). Student records remain 100% private on their personal device. To support device migration, a robust JSON Export/Restore feature was implemented.
3. **Continuous Background Polling vs. Native OS Alarms:**
   - *Tension:* Running a continuous background JavaScript loop (`while(appIsRunning) checkDeadline()`) is easy to code, but drains device battery and is killed by Android's memory manager when the app is closed.
   - *Decision:* Transitioned entirely to **Capacitor Local Notifications interfacing with Android `AlarmManager`**. Reminders are pre-calculated and scheduled directly with the phone's operating system. Zero battery drain; 100% reliability when closed.
4. **Rich Visual Design vs. Mobile Performance:**
   - *Tension:* Large SVG mascot graphics and luminous background blur orbs look impressive on desktop monitors, but consume vertical space and GPU resources on budget mobile phones.
   - *Decision:* Created specialized mobile media queries (`@media (max-width: 820px)`). The duplicated mascot graphic is hidden on mobile screens, and blur filters are optimized to ensure smooth 60fps scrolling.

### 7.3 Iterative Prototype Revisions
- **Iteration 1 (Navigation Redesign):** Transitioned desktop sidebar navigation into an ergonomic 5-tab fixed bottom navigation bar (`.mobile-nav`) on screens under 768px, respecting hardware safe-area insets.
- **Iteration 2 (Login Screen Optimization):** Streamlined `index.html` on mobile from a 300px tall header to a compact 60px branded banner, ensuring form inputs and the PWA Install button fit comfortably within a single phone viewport.
- **Iteration 3 (Native Alarms Engine):** Engineered `local-notifications.js`, introducing deterministic notification IDs (`taskId * 10 + 1..4`) and automatic rescheduling on device boot (`RECEIVE_BOOT_COMPLETED`).

---

# CHAPTER 8: FINAL SOLUTION & SPECIFICATIONS

### 8.1 System Overview: Deadline Buddy
**Deadline Buddy** is a student-centered academic planning and deadline management application engineered for Senior High School learners. It operates across web browsers as an installable Progressive Web App (PWA) and on mobile devices as an installed native Android app.

```
                  DEADLINE BUDDY ARCHITECTURE
                               │
              ┌────────────────┴────────────────┐
              │                                 │
              ▼                                 ▼
         Web / PWA                     Installed Android App
              │                                 │
              ▼                                 ▼
       Service Worker                       Capacitor
     (service-worker.js)                        │
              │                                 ▼
       Offline caching                 Local Notifications
      & Web Push alerts              (local-notifications.js)
              │                                 │
              ▼                                 ▼
      Dual Local Storage                 Android AlarmManager
    (localStorage + IndexedDB)                  │
                                                ▼
                                       System Notifications
                                      (Sound, Vibrate, Wakes Screen)
```

### 8.2 Core Functional Modules

1. **Student Account & Profile Module:** Lightweight student authentication supporting grade level and academic track personalization (ASSH, STEM, ABM, HUMSS, GAS, TVL).
2. **Subject Management Module:** Complete management of school subjects with custom color tags, teacher names, and room designations.
3. **Class Schedule Engine:** Mapping of weekly meeting days (e.g., MWF, TTH) and class hours to contextualize academic obligations.
4. **"Today's Classes" Dynamic Card:** Automatically evaluates the current day of the week and renders an immediate list of classes scheduled for today.
5. **Academic Requirement Management:** Create, read, update, and delete (CRUD) tasks with title, subject linkage, due date, due time, priority, and guidelines.
6. **"Today's Deadlines" Priority Banner:** Filters all active requirements and highlights tasks whose submission deadline falls before 11:59 PM today.
7. **Deadline Status & Urgency Classification:** Real-time arithmetic engine classifying tasks into five distinct urgency tiers: *Completed*, *Overdue*, *Urgent* ($\le 24\text{h}$ or $\le 20\text{m}$), *Due Today*, and *Upcoming*.
8. **Priority Focus Card & Live Countdown:** Spotlight on the single most critical imminent requirement, updated every second with a live countdown timer.
9. **Step-by-Step Subtask Checklist:** Interactive checklist module allowing large projects to be decomposed into discrete micro-steps with an animated progress bar.
10. **Interactive Academic Calendar:** Full-month visual calendar highlighting deadline concentrations with interactive date-selection inspection panels.
11. **Multi-Stage Reminder Notification System:** Automatically calculates and registers up to four distinct advance alarms per requirement:
    - **1 Day Before** (Deadline $- 24$ hours): Advance preparation prompt.
    - **1 Hour Before** (Deadline $- 1$ hour): Imminent submission alert.
    - **20 Minutes Before** (Deadline $- 20$ minutes): Final call warning.
    - **Overdue Alert** (Deadline $+ 1$ minute): Immediate notification of passed deadline.
12. **Offline-First Data Engine:** Zero-server persistence using browser `localStorage` and `IndexedDB`. All records remain accessible with zero network connectivity.
13. **Progressive Web App (PWA) Installation:** Web App Manifest (`manifest.json`) and Service Worker (`service-worker.js`) enabling one-tap installation on Android, iOS, Windows, and macOS.
14. **Installed Android Mobile Application:** Packaged via Capacitor CLI, generating a native Android Studio build with dedicated launcher icons and splash screens.
15. **Closed-App Native Alarm Execution:** Utilizes Android `AlarmManager` to ensure that scheduled reminders trigger notifications with sound and vibration even when the app is completely closed and Wi-Fi is turned off.
16. **Local Backup & Restore System:** One-click JSON data export and import functionality on the Profile page, enabling seamless data portability and presentation resets.

### 8.3 Ethical, Social, and Environmental Considerations

#### Ethical Considerations
- **Strict Data Sovereignty:** Student assignments, schedules, and names are stored exclusively on the user's local device hardware. Zero personal telemetry is transmitted to external cloud servers.
- **Transparent Permissions:** Notification and alarm permissions are requested only after explaining their exact operational purpose to the student.
- **Destructive Action Confirmation:** All record cleaning and account deletion actions require explicit two-step confirmation modals to protect student data.

#### Social Considerations
- **Student Empowerment, Not Automation:** Deadline Buddy does not complete homework or replace teacher-student communication; it equips students with personal executive functioning and time-management skills.
- **Digital Equity:** Engineered specifically to run smoothly on budget Android devices and low-spec school netbooks without requiring costly cellular data plans.

#### Environmental Considerations
- **Paperless Academic Transition:** Replaces disposable paper assignment notebooks, paper calendars, and printed sticky notes.
- **Energy-Efficient Architecture:** Eliminating continuous background polling loops preserves mobile battery life and reduces carbon footprint from unnecessary server computations.

### 8.4 Universal Accessibility, Typography, and Touch Design
- **High-Contrast Color Palettes:** Complies with WCAG 2.1 Level AA contrast standards across both *Default Coral Pink* and *Clean Blue* color modes.
- **Typography:** Uses clean, humanist typography (*Inter* via Google Fonts with local system font fallbacks) with fluid clamp scaling (`clamp(1rem, 2.5vw, 1.25rem)`).
- **Touch-Friendly Controls:** All interactive buttons, checkboxes, and tabs adhere to the minimum $44\times 44\text{px}$ touch target standard.
- **Keyboard & Screen Reader Operability:** Semantic HTML structure and visible `:focus-visible` outline rings enable full keyboard navigation for motor-impaired learners.

---

# CHAPTER 9: EVALUATION AND REFLECTION

### 9.1 Key Pedagogical Learnings
Applying the Design Thinking framework transformed the team's engineering perspective:
- **Assumptions vs. Reality:** The team initially assumed students needed complex social study features. Direct user interviews proved that students were already overwhelmed by social chatter on Messenger and desperately needed a quiet, focused, independent deadline tracker.
- **The Primacy of Offline Functionality:** Designing for Filipino high school learners demands designing for intermittent connectivity. Building offline-first is an imperative of educational equity.

### 9.2 What Worked Well
1. **The Dual PWA + Capacitor Android Model:** Providing a zero-install browser PWA alongside an installable Android APK proved ideal. Evaluators could test the web version immediately via GitHub Pages, while students wanting closed-app alarms could install the Android APK.
2. **Dynamic Dashboard Prioritization:** Grouping tasks into "Today's Classes" and "Today's Deadlines" received universal praise from both students and teachers during usability testing.
3. **Deterministic Alarm ID Formulas:** Formulating notification IDs as `taskId * 10 + offset` allowed instantaneous cancellation and rescheduling without requiring complex database tracking tables.

### 9.3 What Did Not Work and Required Re-engineering
1. **The Electron Desktop Experiment:** The initial plan included an Electron Windows desktop build with system tray reminders. However, testing showed that high school students predominantly track homework on mobile phones while commuting or at home. Electron introduced bloated 114MB zip packages that violated GitHub repository limits and offered zero mobile utility. The team made the bold architectural pivot to completely delete Electron and embrace Capacitor Android.
2. **Mobile Viewport Squeeze:** The original desktop login layout featured a split card with large mascot artwork. On narrow smartphone viewports, this created an uncomfortably tall header that pushed form buttons off-screen. Re-engineering the CSS media queries into a compact header resolved the problem.
3. **Android 13+ Notification Permissions:** Newer Android versions treat notifications as runtime permissions. The application initially failed to trigger alarms on Android 13+ until explicit permission check and request wrappers were integrated into `local-notifications.js`.

### 9.4 How User Feedback Addressed Core Deficiencies
- **Feedback:** Students reported anxiety over when a reminder would sound.  
  *Action Taken:* Added a transparent "Scheduled Reminders" count and status badge on `reminders.html` and `profile.html`, showing users exactly how many alarms are active.
- **Feedback:** Teachers expressed that students often feel overwhelmed by semester-long research papers.  
  *Action Taken:* Built the subtask checklist feature into `task-details.html`, allowing learners to check off incremental milestones.

### 9.5 Practical Project Limitations
1. **Local-Only Storage:** Because data is stored in `localStorage`/`IndexedDB` for offline privacy, changes made on a mobile phone do not automatically synchronize to a laptop without using the manual JSON Export/Restore feature.
2. **Device Dependency for Alarms:** Closed-app background reminders can only trigger if the phone is powered on. If a phone battery is completely dead, alarms cannot execute until the device restarts.
3. **Operating System Battery Optimizations:** Certain aggressive manufacturer-specific Android skins (e.g., Xiaomi MIUI, Huawei EMUI) may restrict alarm execution unless the student allows "Unrestricted Battery Usage" in phone settings.

---

# CHAPTER 10: CONCLUSION AND RECOMMENDATIONS

### 10.1 Conclusion
The **Deadline Buddy Project** demonstrates that human-centered software design can meaningfully resolve the pervasive organizational crisis experienced by Senior High School students. By methodically moving through the Design Thinking phases—empathizing with student stress, defining the deadline fragmentation problem, ideating focused solutions, engineering an offline-first PWA and Capacitor Android prototype, and validating usability with real learners and faculty—the team delivered an accessible, elegant, and highly functional academic companion.

Deadline Buddy replaces chaos with clarity. By presenting daily schedules, filtering imminent deadlines, breaking projects into checklists, and scheduling native alarms that wake the device even when the app is closed, the system empowers Grade 11 and Grade 12 students to take ownership of their academic obligations and achieve their educational goals without sacrificing mental wellness.

### 10.2 Strategic Recommendations for Scale
1. **Institutional Strand-Wide Pilot:** Deploy Deadline Buddy across all Grade 11 and Grade 12 sections at Olinsterg College Inc. for a full academic semester to measure longitudinal impacts on submission timeliness and grade averages.
2. **Optional Peer-to-Peer Bluetooth Sync:** Investigate Web Bluetooth or local Wi-Fi direct synchronization to allow classmates to share subject schedules and assignment guidelines offline without requiring internet servers.
3. **Teacher Broadcast Integration:** Develop an optional, privacy-preserving QR-code generator allowing teachers to display a QR code on the classroom whiteboard that students can scan to instantly import a complete assignment with its deadline and checklist.
4. **Official Google Play Store Publication:** Package and sign the Capacitor Android build as a formal `.aab` (Android App Bundle) for direct release on the Google Play Store, further simplifying mobile installation for students.

---

## REFERENCES (APA 7th Edition)

- Brown, T. (2009). *Change by design: How design thinking transforms organizations and inspires innovation*. HarperBusiness.
- Capacitor Documentation. (2024). *Local Notifications Capacitor Plugin API*. Ionic Framework. https://capacitorjs.com/docs/apis/local-notifications
- Google Developers. (2023). *Progressive Web Apps overview*. web.dev. https://web.dev/explore/progressive-web-apps
- Interaction Design Foundation. (2021). *What is Human-Centered Design?*. https://www.interaction-design.org/literature/topics/human-centered-design
- Mozilla Developer Network (MDN). (2024). *Service Worker API & Offline Web Applications*. Mozilla. https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API
- Norman, D. (2013). *The design of everyday things* (Revised and expanded ed.). Basic Books.
- World Wide Web Consortium (W3C). (2018). *Web Content Accessibility Guidelines (WCAG) 2.1*. W3C Recommendation. https://www.w3.org/TR/WCAG21/

---

## APPENDICES (A through N)

### Appendix A – Ethical Clearance & Informed Consent Documentation
Formal participant information sheet and voluntary informed consent forms distributed to Senior High School students prior to usability walkthroughs.

### Appendix B – User Interview Protocol & Questionnaire
Structured qualitative interview guide used during semi-structured campus inquiry sessions.

### Appendix C – Student Survey Instrument
The 9-item quantitative questionnaire gauging student assignment tracking methods and reminder preferences.

### Appendix D – Campus Workflow Observation Logs
Field notes documenting student deadline checking routines, group chat announcements, and assignment submission rushes.

### Appendix E – User & Stakeholder Map
Visual stakeholder analysis diagram mapping high/low influence and interest among students, subject teachers, school administrators, and parents.

### Appendix F – Student Empathy Map
Full-page synthesis diagram documenting what Grade 11 and Grade 12 students Say, Think, Do, and Feel during deadline-heavy examination weeks.

### Appendix G – Rose-Thorn-Bud Analysis Worksheet
Detailed design innovation taxonomy detailing student digital practices (Roses), organizational pain points (Thorns), and design opportunities (Buds).

### Appendix H – Ideation Log & SCAMPER Brainstorming Sheets
Chronological documentation of initial brainstorming sessions, divergent sketches, and SCAMPER feature adaptation notes.

### Appendix I – Idea Selection Matrix & Scoring Sheets
Multi-criteria evaluation matrix scoring competing planner concepts across relevance, urgency, reminders, offline access, and usability.

### Appendix J – Deadline Buddy Prototype Architecture & Screen Layouts
System architecture diagrams and responsive mobile layout schematics for all 8 main web application views.

### Appendix K – User Testing Documentation & Task Performance Records
Task completion time logs and think-aloud observation records from student usability walkthrough sessions.

### Appendix L – Usability Feedback Matrix
Itemized compilation of positive student feedback, usability bottlenecks, and recommended design interventions.

### Appendix M – Revised Prototype Documentation
Before-and-after visual documentation illustrating the transition from desktop-heavy cards to touch-optimized mobile screens.

### Appendix N – Live Deployment & Repository Verification
Verification logs documenting the live GitHub Pages Progressive Web App (`https://03dxd12.github.io/Deadline-Buddy/`) and compiled Capacitor Android native project files.
