import React from "react";
import { HashRouter, Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { DashboardPage } from "@/pages/DashboardPage";
import { MyDayPage } from "@/pages/MyDayPage";
import { InboxPage } from "@/pages/InboxPage";
import { AllTasksPage } from "@/pages/AllTasksPage";
import { CategoriesPage } from "@/pages/CategoriesPage";
import { ProjectsPage } from "@/pages/ProjectsPage";
import { CalendarPage } from "@/pages/CalendarPage";
import { HabitsPage } from "@/pages/HabitsPage";
import { GoalsPage } from "@/pages/GoalsPage";
import { NotesPage } from "@/pages/NotesPage";
import { AnalyticsPage } from "@/pages/AnalyticsPage";
import { WidgetCenterPage } from "@/pages/WidgetCenterPage";
import { ArchivePage } from "@/pages/ArchivePage";
import { SettingsPage } from "@/pages/SettingsPage";
import { TaskDetailsModal } from "@/components/tasks/TaskDetailsModal";

// Standalone widget imports
import { StandaloneWidgetContainer } from "@/components/widgets/StandaloneWidgetContainer";
import { TodayTasksWidget } from "@/components/widgets/TodayTasksWidget";
import { QuickAddWidget } from "@/components/widgets/QuickAddWidget";
import { PomodoroWidget } from "@/components/widgets/PomodoroWidget";
import { HabitTrackerWidget } from "@/components/widgets/HabitTrackerWidget";

export const App: React.FC = () => {
  // Check if loaded inside an independent widget window via query parameter: ?widget=<type>
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : "");
  const widgetParam = params.get("widget") || hashParams.get("widget");

  if (widgetParam) {
    switch (widgetParam) {
      case "today_tasks":
        return (
          <StandaloneWidgetContainer title="Today's Tasks">
            <TodayTasksWidget />
          </StandaloneWidgetContainer>
        );
      case "quick_add":
        return (
          <StandaloneWidgetContainer title="Quick Add">
            <QuickAddWidget />
          </StandaloneWidgetContainer>
        );
      case "pomodoro":
        return (
          <StandaloneWidgetContainer title="Pomodoro Timer">
            <PomodoroWidget />
          </StandaloneWidgetContainer>
        );
      case "habits":
        return (
          <StandaloneWidgetContainer title="Habits Tracker">
            <HabitTrackerWidget />
          </StandaloneWidgetContainer>
        );
      default:
        break;
    }
  }

  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="my-day" element={<MyDayPage />} />
          <Route path="inbox" element={<InboxPage />} />
          <Route path="tasks" element={<AllTasksPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="projects" element={<ProjectsPage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="habits" element={<HabitsPage />} />
          <Route path="goals" element={<GoalsPage />} />
          <Route path="notes" element={<NotesPage />} />
          <Route path="analytics" element={<AnalyticsPage />} />
          <Route path="widgets" element={<WidgetCenterPage />} />
          <Route path="archive" element={<ArchivePage />} />
          <Route path="settings" element={<SettingsPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
      <TaskDetailsModal />
    </HashRouter>
  );
};
