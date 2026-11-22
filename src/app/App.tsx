import React, { Suspense, lazy } from "react";
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

// Standalone widget lazy imports (only loaded in separate pop-out windows)
const StandaloneWidgetContainer = lazy(() =>
  import("@/components/widgets/StandaloneWidgetContainer").then((m) => ({ default: m.StandaloneWidgetContainer }))
);
const TodayTasksWidget = lazy(() =>
  import("@/components/widgets/TodayTasksWidget").then((m) => ({ default: m.TodayTasksWidget }))
);
const QuickAddWidget = lazy(() =>
  import("@/components/widgets/QuickAddWidget").then((m) => ({ default: m.QuickAddWidget }))
);
const FocusWidget = lazy(() =>
  import("@/components/widgets/FocusWidget").then((m) => ({ default: m.FocusWidget }))
);
const HabitTrackerWidget = lazy(() =>
  import("@/components/widgets/HabitTrackerWidget").then((m) => ({ default: m.HabitTrackerWidget }))
);
const DailyScheduleWidget = lazy(() =>
  import("@/components/widgets/DailyScheduleWidget").then((m) => ({ default: m.DailyScheduleWidget }))
);

const PageFallback: React.FC = () => (
  <div className="flex-1 min-h-[400px] flex items-center justify-center bg-transparent" />
);

export const App: React.FC = () => {
  // Check if loaded inside an independent widget window via query parameter: ?widget=<type>
  const params = new URLSearchParams(window.location.search);
  const hash = window.location.hash;
  const hashParams = new URLSearchParams(hash.includes("?") ? hash.split("?")[1] : "");
  const widgetParam = params.get("widget") || hashParams.get("widget");

  if (widgetParam) {
    return (
      <Suspense fallback={<PageFallback />}>
        {widgetParam === "today_tasks" && (
          <StandaloneWidgetContainer title="Today's Tasks" widgetType="today_tasks">
            <TodayTasksWidget />
          </StandaloneWidgetContainer>
        )}
        {widgetParam === "quick_add" && (
          <StandaloneWidgetContainer title="Quick Add" widgetType="quick_add">
            <QuickAddWidget />
          </StandaloneWidgetContainer>
        )}
        {(widgetParam === "focus" || widgetParam === "pomodoro") && (
          <StandaloneWidgetContainer title="Focus Stopwatch" widgetType="focus">
            <FocusWidget />
          </StandaloneWidgetContainer>
        )}
        {widgetParam === "habits" && (
          <StandaloneWidgetContainer title="Habits Tracker" widgetType="habits">
            <HabitTrackerWidget />
          </StandaloneWidgetContainer>
        )}
        {widgetParam === "schedule" && (
          <StandaloneWidgetContainer title="Daily Schedule" widgetType="schedule">
            <DailyScheduleWidget />
          </StandaloneWidgetContainer>
        )}
      </Suspense>
    );
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
