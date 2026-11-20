# LifeFlow --- Project Plan

## Personal Desktop Productivity Manager

**Document version:** 1.0\
**Project type:** Windows Desktop Application\
**Architecture:** Offline-first, local-only\
**Working name:** LifeFlow

------------------------------------------------------------------------

## 1. Project Overview

LifeFlow is a premium personal productivity desktop application for
Windows. It brings tasks, projects, calendar planning, habits, goals,
notes, reminders, analytics, and desktop widgets into one organized
workspace.

The application is designed for a single user and must work fully
offline. All personal data is stored locally on the user's device. No
account, cloud service, hosted backend, or internet connection is
required for core functionality.

### Product goals

-   Make daily planning and task management fast and intuitive.
-   Organize independent tasks and tasks belonging to projects.
-   Support recurring tasks, subtasks, dependencies, reminders, and
    priorities.
-   Help the user track habits and longer-term goals.
-   Provide a clear view of progress and productivity trends.
-   Offer lightweight desktop widgets that can remain visible outside
    the main window.
-   Protect user data through reliable local storage and backup/restore.
-   Deliver a polished, consistent desktop experience in Arabic and
    English.

### Non-goals for the initial release

-   Multi-user collaboration.
-   Cloud synchronization.
-   User accounts and authentication.
-   Team management.
-   Online AI services or features that require sending personal data
    externally.
-   Mobile application.

------------------------------------------------------------------------

## 2. Product Decisions

  -----------------------------------------------------------------------
  Area                                Decision
  ----------------------------------- -----------------------------------
  Platform                            Windows desktop

  Framework                           Electron

  UI                                  React + TypeScript

  Styling                             Tailwind CSS

  Database                            SQLite

  Database access                     `better-sqlite3`, through the
                                      Electron main process

  State management                    Zustand

  Navigation                          React Router

  Localization                        i18next

  Validation                          Zod

  Charts                              A suitable React chart library,
                                      selected only if needed

  Testing                             Vitest and Playwright

  Language                            Arabic and English

  Direction                           Full RTL for Arabic; LTR for
                                      English

  Theme                               Dark theme for initial release

  Notifications                       In-app and Windows notifications

  Connectivity                        Core functionality must work
                                      offline

  Data location                       Local application data directory

  Distribution                        Windows installer
  -----------------------------------------------------------------------

Technology choices should be confirmed against the existing repository
before adding or replacing dependencies.

------------------------------------------------------------------------

## 3. Design System and UX Direction

### Visual identity

LifeFlow should feel like a polished commercial productivity product
rather than a generic admin dashboard.

Suggested palette:

  Token              Color
  ------------------ -----------
  Main background    `#111318`
  Sidebar            `#151920`
  Card surface       `#191D24`
  Elevated surface   `#252B35`
  Primary accent     `#E99A43`
  Primary text       `#F3F4F6`
  Secondary text     `#9299A5`

### Typography

-   Inter for English.
-   Cairo for Arabic.
-   Consistent font sizes, weights, and line heights.
-   Correct text shaping and alignment in both languages.

### Interface principles

-   Desktop-first, with support for smaller application windows.
-   Collapsible sidebar and consistent shared header.
-   Reusable cards, dialogs, forms, tables, filters, and empty states.
-   Subtle borders, restrained shadows, and purposeful animation.
-   Consistent spacing, corner radii, icon sizes, and interaction
    states.
-   Avoid excessive gradients, glassmorphism, visual clutter, and
    oversized headings.
-   Keyboard accessibility and clear focus states.

### Shared application shell

The shell should be implemented once and reused by all pages:

-   Sidebar navigation.
-   Top header.
-   Global search entry point.
-   Quick Add action.
-   Notification center entry point.
-   Main content area.
-   Language and layout direction handling.

------------------------------------------------------------------------

## 4. Application Modules and Pages

### 4.1 Dashboard

The main overview of the user's day.

Features: - Time-based greeting and current date. - Daily progress and
completion percentage. - Today's tasks. - Overdue tasks. - Upcoming
deadlines. - Active project cards. - Today's habit progress. - Weekly
productivity summary. - Quick Add task action. - Configurable dashboard
widgets in a future iteration.

### 4.2 My Day

A focused daily planning workspace.

Features: - Tasks scheduled for today. - Tasks manually added to My Day
without changing their original due date. - Reordering and
prioritization. - Completion controls. - Overdue tasks shown
separately. - Move task to another day. - Daily progress summary.

### 4.3 Inbox

A fast capture area for tasks that have not yet been organized.

Features: - Quick task creation. - Minimal required fields. - Convert an
inbox item into a planned task. - Assign project, category, tags,
priority, and due date. - Bulk organization.

### 4.4 All Tasks

The central task management page.

Features: - List view. - Kanban view. - Search, filters, and sorting. -
Priority and status controls. - Due date and project labels. - Bulk
actions. - Task creation, editing, completion, archive, and restore. -
Saved filters may be added in a later release.

### 4.5 Task Details

A dedicated task view or modal.

Task fields: - Title. - Description. - Status. - Priority. - Start
date/time. - Due date/time. - Project. - Category. - Tags. - Subtasks. -
Dependencies. - Recurrence settings. - Reminders. - Attachments. -
Created and updated timestamps. - Completion timestamp. - Activity
history.

### 4.6 Projects

Organize related tasks into projects.

Features: - Create, edit, archive, and restore projects. - Project
description and color. - Start date and deadline. - Project task list. -
Project progress. - Project status. - Project-level filters and sorting.

### 4.7 Calendar

A calendar view of scheduled work.

Features: - Month, week, and day views. - Tasks and deadlines. -
Navigate between dates. - Open task details from calendar entries. -
Create tasks from a selected date. - Clear visual distinction between
due dates and scheduled start times.

### 4.8 Habits

Track recurring personal habits.

Features: - Create and edit habits. - Daily, selected weekdays, weekly,
and custom schedules. - Target value and unit when applicable. - Daily
completion logs. - Streak and consistency calculations. - Habit history
and progress view. - Pause or archive a habit.

### 4.9 Goals

Track larger objectives.

Features: - Create goals with start and target dates. - Goal status. -
Milestones. - Progress tracking. - Optional links to supporting
projects. - Goal overview and history.

### 4.10 Notes

A local notes workspace.

Features: - Create, edit, pin, and archive notes. - Search notes. -
Tags. - Simple rich-text or Markdown support, subject to implementation
scope. - Attachments where appropriate.

### 4.11 Analytics

Present useful productivity information without encouraging unhealthy
overwork.

Features: - Tasks completed over time. - Completion trends. - Project
progress. - Habit consistency. - Distribution by priority and
category. - Weekly and monthly summaries. - Date-range filters.

### 4.12 Archive

A place for archived records.

Features: - View archived tasks, projects, habits, and notes. - Restore
records. - Permanently delete records after confirmation. - Search and
filter archived items.

### 4.13 Widget Center

Manage optional desktop widgets.

Initial widget candidates: - Today's Tasks. - Quick Add. - Pomodoro
Timer. - Upcoming Calendar. - Habit Tracker. - Daily Progress. - Sticky
Notes.

Widget capabilities: - Enable and disable widgets. - Independent
Electron windows. - Optional always-on-top behavior. - Move and
resize. - Persist window position and size. - Optional transparency and
compact presentation. - Communicate safely with the main application. -
Refresh data from the local database.

Desktop widgets are LifeFlow-managed Electron windows. Native Windows
Widgets integration is not part of the initial release.

### 4.14 Settings

Settings categories: - Language. - Date and time format. - Week start
day. - Notification preferences. - Default reminder behavior. - Widget
preferences. - Backup and restore. - Data export. - About and
application version.

------------------------------------------------------------------------

## 5. Task Rules and Business Logic

### Statuses

Recommended statuses: - Inbox. - Todo. - In Progress. - Done. -
Cancelled.

### Priorities

-   Low.
-   Medium.
-   High.
-   Urgent.

### Task behavior

-   A task may belong to a project or remain independent.
-   A task may have multiple subtasks.
-   A task may have tags and one category.
-   A task may have one or more reminders.
-   A task may depend on other tasks.
-   A task may be recurring.
-   Completed tasks remain in the database.
-   Archiving is different from deleting.
-   Overdue state is derived from the due date and completion status
    rather than stored as a manually maintained status.

### Subtasks

-   Subtasks belong to one parent task.
-   Their ordering is persisted.
-   The parent task may optionally display progress based on completed
    subtasks.
-   The user must be able to choose whether completion of all subtasks
    automatically completes the parent task.

### Dependencies

-   Prevent dependency cycles.
-   A task with incomplete blocking dependencies should be visibly
    marked as blocked.
-   Do not silently delete dependent tasks when a dependency is removed.

### Recurring tasks

Support: - Daily. - Weekly. - Monthly. - Yearly. - Custom interval. -
Selected weekdays. - Optional end date. - Optional maximum occurrence
count.

When a recurring task is completed, create the next occurrence while
retaining the completed occurrence and its history. Recurrence
generation must avoid duplicate occurrences and handle missed dates
safely.

### My Day

Adding a task to My Day must not overwrite its original due date. Store
daily planning membership separately so the user can plan the same task
without changing its deadline.

------------------------------------------------------------------------

## 6. Database Architecture

Database file: `lifeflow.db`

Use SQLite with: - Foreign key enforcement. - WAL mode where
appropriate. - Parameterized queries. - Transactions for multi-step
operations. - Schema migrations from the first release. - Indexes for
common filters and lookups. - Consistent timestamps stored in ISO 8601
UTC and converted to local time for display. - UUID text identifiers.

### Core tables

  Table                 Purpose
  --------------------- -----------------------------------------
  `tasks`               Main task records
  `subtasks`            Child tasks
  `task_dependencies`   Task blocking relationships
  `projects`            Project records
  `categories`          Task categories
  `tags`                Reusable tags
  `task_tags`           Many-to-many task/tag relationship
  `task_day_plans`      Tasks added to My Day on specific dates
  `reminders`           Reminder schedules
  `notification_logs`   Notification delivery history
  `habits`              Habit definitions
  `habit_logs`          Habit completion records
  `goals`               Goal records
  `goal_milestones`     Goal milestones
  `notes`               Note records
  `note_tags`           Many-to-many note/tag relationship
  `attachments`         Metadata for local files
  `app_settings`        Application preferences
  `activity_logs`       Relevant record activity history

### Main entity relationships

-   One project can contain many tasks.
-   One category can classify many tasks.
-   One task can contain many subtasks.
-   Tasks can depend on other tasks through a relationship table.
-   Tasks can have many reminders.
-   Tasks and tags have a many-to-many relationship.
-   One habit can have many habit logs.
-   One goal can have many milestones.
-   Notes and tags have a many-to-many relationship.
-   Attachments can be associated with supported records through a
    carefully validated owner relationship.

### Important schema requirements

-   Use foreign keys and define delete behavior explicitly.
-   Prefer restrictive or controlled deletion for important
    relationships.
-   Use soft deletion or archival where recovery is expected.
-   Add indexes for `tasks.status`, `tasks.due_at`, `tasks.project_id`,
    and other frequently queried fields.
-   Validate all writes.
-   Use migrations rather than manually replacing the database schema.
-   Never store absolute attachment paths without validating and
    managing the referenced file.
-   Do not store derived values such as overdue status when they can be
    reliably calculated.

### Initial task schema proposal

`tasks`: - `id` TEXT PRIMARY KEY - `title` TEXT NOT NULL - `description`
TEXT - `status` TEXT NOT NULL - `priority` TEXT NOT NULL - `project_id`
TEXT NULL - `category_id` TEXT NULL - `start_at` TEXT NULL - `due_at`
TEXT NULL - `completed_at` TEXT NULL - `recurrence_rule` TEXT NULL -
`recurrence_series_id` TEXT NULL - `created_at` TEXT NOT NULL -
`updated_at` TEXT NOT NULL - `archived_at` TEXT NULL - `deleted_at` TEXT
NULL

The final schema must be normalized and documented before
implementation. Avoid adding unused speculative tables.

------------------------------------------------------------------------

## 7. Technical Architecture

Use a layered architecture with clear boundaries.

### Renderer process

Responsible for: - React pages and components. - User interactions. - UI
state. - Localization. - Form validation feedback. - Displaying data
returned by application services.

The renderer must not access SQLite or unrestricted Node.js APIs
directly.

### Electron main process

Responsible for: - Application lifecycle. - Database initialization. -
IPC handlers. - Application services. - Notification scheduling. -
Desktop widget windows. - Local file operations. - Backup and restore
operations.

### Preload layer

Expose a small, typed, allowlisted API through `contextBridge`.

Security requirements: - `contextIsolation: true`. -
`nodeIntegration: false`. - Validate IPC inputs. - Do not expose raw
filesystem or database access. - Restrict navigation and external
content. - Keep renderer permissions minimal.

### Application services

Suggested service boundaries: - TaskService. - ProjectService. -
CalendarService. - HabitService. - GoalService. - NotesService. -
ReminderService. - NotificationService. - BackupService. -
ExportService. - WidgetService.

### Repository layer

Repositories own database queries and persistence. Services own business
rules. UI components should not contain SQL queries.

------------------------------------------------------------------------

## 8. Notifications and Scheduling

Support two notification channels:

1.  In-app notification center.
2.  Native Windows notifications.

Notification types: - Task reminder. - Upcoming deadline. - Overdue
task. - Habit reminder. - Daily planning reminder. - Weekly review
reminder.

Requirements: - Prevent duplicate delivery. - Persist delivery attempts
and outcomes. - Respect user preferences. - Handle disabled Windows
notifications gracefully. - Rebuild pending schedules when the
application starts. - Explain that notifications cannot fire while the
application and its background process are fully closed. - Do not claim
that a reminder was delivered unless the relevant API reports success.

------------------------------------------------------------------------

## 9. Local Files and Backup

Suggested local data structure:

``` text
LifeFlow/
├── database/
│   └── lifeflow.db
├── attachments/
│   ├── tasks/
│   └── notes/
├── backups/
│   ├── automatic/
│   └── manual/
└── logs/
```

Use the operating system's appropriate application-data directory rather
than assuming a fixed installation path.

### Backup requirements

-   Manual backup.
-   Automatic backup.
-   Configurable retention count.
-   Backup validation.
-   Restore with confirmation.
-   Safe handling of database and attachment files together.
-   Use SQLite's backup facilities or another SQLite-safe approach; do
    not blindly copy an active database file.
-   Create a recovery point before restoring.
-   Report success or failure clearly.

### Export

-   CSV export for tasks and relevant tabular records.
-   PDF reports for selected summaries.
-   Export operations must not modify the original records.

------------------------------------------------------------------------

## 10. Desktop Widgets

Widgets are independent LifeFlow-managed Electron windows.

Initial widget designs: 1. Today's Tasks. 2. Quick Add. 3. Pomodoro
Timer. 4. Upcoming Calendar. 5. Habit Tracker. 6. Daily Progress. 7.
Sticky Notes.

Requirements: - Each widget can be enabled or disabled. - Persist window
size and position. - Optional always-on-top. - Avoid duplicate
windows. - Keep widget UI lightweight. - Use the same design system as
the main application. - Communicate through typed IPC. - Keep all data
local. - Handle main-window closure and application quit predictably.

The Widget Center is the configuration interface. Native Windows Widgets
platform integration is a possible future investigation, not an assumed
feature.

------------------------------------------------------------------------

## 11. Project Folder Structure

Adapt this structure to the existing repository rather than forcing a
destructive restructure.

``` text
lifeflow/
├── electron/
│   ├── main.ts
│   ├── preload.ts
│   ├── ipc/
│   ├── windows/
│   └── services/
├── src/
│   ├── app/
│   ├── components/
│   ├── layouts/
│   ├── pages/
│   ├── modules/
│   │   ├── dashboard/
│   │   ├── my-day/
│   │   ├── inbox/
│   │   ├── tasks/
│   │   ├── projects/
│   │   ├── calendar/
│   │   ├── habits/
│   │   ├── goals/
│   │   ├── notes/
│   │   ├── analytics/
│   │   ├── archive/
│   │   └── widgets/
│   ├── hooks/
│   ├── store/
│   ├── locales/
│   └── styles/
├── database/
│   ├── migrations/
│   ├── schema/
│   └── repositories/
├── shared/
│   ├── types/
│   ├── schemas/
│   └── constants/
├── tests/
└── package.json
```

------------------------------------------------------------------------

## 12. Implementation Roadmap

Implementation must proceed incrementally. Each phase must be completed,
tested, and reviewed before starting the next phase.

### Phase 0 --- Repository Audit and Foundation

-   Inspect the existing repository.
-   Confirm Electron, React, and TypeScript setup.
-   Verify build and development commands.
-   Establish shared design tokens.
-   Establish typed IPC conventions.
-   Establish localization and RTL/LTR infrastructure.
-   Configure linting and testing.
-   Do not implement all pages at once.

**Exit criteria:** The app starts reliably and the shared shell
foundation is in place.

### Phase 1 --- Design System and Application Shell

-   Sidebar.
-   Header.
-   Navigation.
-   Shared dialogs and buttons.
-   Cards and form controls.
-   Arabic and English direction switching.
-   Dark theme.
-   Responsive desktop layout.

**Exit criteria:** Shared layout is visually consistent and works in
both languages.

### Phase 2 --- Database and Core Task Engine

-   SQLite initialization.
-   Migrations.
-   Repositories.
-   Task CRUD.
-   Subtasks.
-   Priorities and statuses.
-   Categories and tags.
-   My Day planning records.
-   Task dependencies.
-   Recurrence foundation.

**Exit criteria:** Task data persists across restarts and core rules are
tested.

### Phase 3 --- Core Task UI

Implement and verify: - Dashboard. - My Day. - Inbox. - All Tasks. -
Task Details. - Quick Add.

**Exit criteria:** The user can create, organize, schedule, complete,
and archive tasks through the UI.

### Phase 4 --- Projects and Calendar

-   Project CRUD.
-   Project progress.
-   Project task views.
-   Calendar month/week/day views.
-   Date-based task creation.
-   Deadline presentation.

**Exit criteria:** Project and calendar data remain consistent with task
records.

### Phase 5 --- Reminders and Notifications

-   Reminder scheduling.
-   In-app notification center.
-   Windows notifications.
-   Duplicate prevention.
-   Startup rescheduling.
-   Notification preferences.

**Exit criteria:** Reminders are correctly scheduled, logged, and
handled after application restart.

### Phase 6 --- Habits, Goals, and Notes

-   Habit definitions and logs.
-   Streak and consistency calculations.
-   Goals and milestones.
-   Notes and tags.
-   Search and archive behavior.

**Exit criteria:** Each module supports complete local CRUD and reliable
history.

### Phase 7 --- Analytics

-   Productivity summaries.
-   Task completion trends.
-   Project progress.
-   Habit consistency.
-   Date range filters.
-   Clear empty states.

**Exit criteria:** Analytics are calculated from persisted records and
are reproducible.

### Phase 8 --- Desktop Widgets

-   Widget Center.
-   Independent widget windows.
-   Today's Tasks widget.
-   Quick Add widget.
-   Pomodoro widget.
-   Upcoming Calendar widget.
-   Habit and progress widgets.
-   Persist widget positions and preferences.

**Exit criteria:** Widgets work reliably while the application is
running in the background.

### Phase 9 --- Backup, Export, and Hardening

-   Automatic and manual backup.
-   Restore.
-   CSV export.
-   PDF reports.
-   Database integrity checks.
-   Error handling.
-   Performance review.
-   Security review.

**Exit criteria:** Backup and restore are verified using realistic test
data.

### Phase 10 --- QA and Windows Release

-   Full regression tests.
-   Arabic and English UI review.
-   RTL layout review.
-   Test on supported Windows screen sizes.
-   Installer build.
-   Clean installation test.
-   Upgrade and data-preservation test.
-   Final release notes.

**Exit criteria:** A tested Windows installer is ready for use.

------------------------------------------------------------------------

## 13. UI Page-by-Page Workflow

UI design is a high priority and must be reviewed page by page.
import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { format, isToday, parseISO } from "date-fns";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { TopBar } from "@/components/dashboard/TopBar";
import { FocusTimer } from "@/components/dashboard/FocusTimer";
import { ProgressCard } from "@/components/dashboard/ProgressCard";
import { TaskList } from "@/components/dashboard/TaskList";
import { MiniCalendar } from "@/components/dashboard/MiniCalendar";
import { useTasks } from "@/hooks/use-tasks";
import { filterTasks, toDateKey, type View } from "@/lib/tasks";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "LifeFlow — Your daily to-do dashboard" },
      {
        name: "description",
        content: "Plan your day, track progress and stay focused with LifeFlow's to-do list, timer and calendar.",
      },
      { property: "og:title", content: "LifeFlow — Your daily to-do dashboard" },
      {
        property: "og:description",
        content: "Plan your day, track progress and stay focused with LifeFlow.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Index,
});

const viewTitles: Record<View, string> = {
  dashboard: "Dashboard",
  today: "Today",
  upcoming: "Upcoming",
  completed: "Completed",
};

function Index() {
  const { tasks, addTask, toggleTask, removeTask } = useTasks();
  const [view, setView] = useState<View>("dashboard");
  const [query, setQuery] = useState("");
  const today = useMemo(() => toDateKey(new Date()), []);
  const [selectedDate, setSelectedDate] = useState(today);

  const visible = filterTasks(tasks, { view, selectedDate, today, query });
  const dayTasks = tasks.filter((t) => t.date === selectedDate);
  const dayLabel = isToday(parseISO(selectedDate))
    ? "Today"
    : format(parseISO(selectedDate), "EEEE, d MMM");

  const listTitle =
    query.trim() ? `Results for “${query.trim()}”`
    : view === "dashboard" ? `${dayLabel === "Today" ? "Today's" : dayLabel} tasks`
    : `${viewTitles[view]} tasks`;

  return (
    <div className="min-h-screen bg-background p-4 sm:p-6">
      <div className="mx-auto flex max-w-7xl flex-col gap-5 lg:flex-row">
        <Sidebar view={view} onChange={setView} tasks={tasks} />
        <main className="flex min-w-0 flex-1 flex-col gap-5">
          <TopBar title={viewTitles[view]} query={query} onQuery={setQuery} />
          <div className="grid gap-5 md:grid-cols-2">
            <FocusTimer />
            <ProgressCard label={dayLabel} tasks={dayTasks} />
            <TaskList
              title={listTitle}
              tasks={visible}
              defaultDate={view === "dashboard" ? selectedDate : today}
              showDates={view !== "dashboard" || !!query.trim()}
              onAdd={addTask}
              onToggle={toggleTask}
              onRemove={removeTask}
            />
            <MiniCalendar
              selected={selectedDate}
              today={today}
              tasks={tasks}
              onSelect={(d) => {
                setSelectedDate(d);
                setView("dashboard");
              }}
            />
          </div>
        </main>
      </div>
    </div>
  );
}

Recommended order:

1.  Dashboard.
2.  My Day.
3.  Inbox.
4.  All Tasks.
5.  Task Details and Quick Add.
6.  Projects.
7.  Calendar.
8.  Habits.
9.  Goals.
10. Notes.
11. Analytics.
12. Archive.
13. Widget Center.
14. Settings.

For each page:

1.  Inspect existing components and design tokens.
2.  Implement only the requested page and shared components it genuinely
    needs.
3.  Preserve existing functionality.
4.  Use isolated mock data only if real data integration is not ready.
5.  Do not claim mock interactions are connected to persistent storage.
6.  Run the application and inspect the actual rendered UI.
7.  Test interactions and both language directions.
8.  Fix visual defects before moving on.
9.  Report changed files and verification results.

Do not redesign unrelated pages without approval.

------------------------------------------------------------------------

## 14. Quality and Testing Strategy

### Unit tests

Test: - Task status transitions. - Overdue calculations. - Recurrence
generation. - Dependency validation and cycle prevention. - Habit streak
calculations. - Goal progress calculations. - Reminder deduplication. -
Backup validation.

### Integration tests

Test: - Services and repositories. - SQLite migrations. - Foreign key
behavior. - Transaction rollback. - IPC input validation. - Notification
scheduling. - Backup and restore.

### UI tests

Test: - Navigation. - Forms and validation. - Task completion. - Filters
and sorting. - Dialogs. - RTL and LTR. - Widget controls. - Empty and
error states.

### Manual verification

Test at: - 1920x1080. - 1600x900. - 1366x768.

Also test: - Fresh installation. - Restart with existing data. - Offline
operation. - Missing or inaccessible attachment files. - Invalid
backup. - Restore flow. - Windows notification permission disabled.

------------------------------------------------------------------------

## 15. Definition of Done

A feature is not complete merely because its screen looks correct.

Every feature must satisfy the relevant criteria:

-   UI follows the approved design system.
-   Arabic and English are supported.
-   RTL and LTR layouts are correct.
-   Inputs are validated.
-   Data persists when applicable.
-   Errors are handled clearly.
-   Loading, empty, and failure states exist.
-   No unrelated functionality is broken.
-   Tests pass.
-   Actual application behavior has been verified.
-   Documentation is updated where necessary.

------------------------------------------------------------------------

## 16. Instructions for Antigravity

Treat this document as the project's product and implementation
reference.

Before every implementation phase:

1.  Read the relevant sections of this plan.
2.  Inspect the current repository and report existing architecture.
3.  Identify dependencies and risks.
4.  Propose the smallest safe set of changes.
5.  Implement only the approved phase.
6.  Run relevant tests and the application.
7.  Inspect the actual result.
8.  Report files changed, tests run, known issues, and remaining work.

Important rules:

-   Do not replace the project or rewrite working code without a clear
    reason.
-   Do not invent successful test results.
-   Do not use fake backend behavior as if it were persistent.
-   Do not expose database access to the renderer.
-   Do not introduce cloud services.
-   Do not add unnecessary dependencies.
-   Do not skip migrations, validation, or backup safety.
-   Do not proceed to the next phase until the current phase is
    reviewed.

**Primary objective:** Build a reliable, attractive, offline-first
personal productivity application whose UI quality, data integrity, and
usability are all treated as first-class requirements.
