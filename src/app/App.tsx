import React from "react";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Shell } from "@/components/layout/Shell";
import { DashboardPage } from "@/pages/DashboardPage";

// Placeholders for subsequent phases
const PlaceholderPage: React.FC<{ title: string }> = ({ title }) => (
  <div className="p-8 rounded-2xl bg-background-card border border-border-subtle text-center">
    <h2 className="text-xl font-bold text-text-primary mb-2">{title}</h2>
    <p className="text-sm text-text-secondary">This module is scheduled for implementation in upcoming phases.</p>
  </div>
);

export const App: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Shell />}>
          <Route index element={<DashboardPage />} />
          <Route path="my-day" element={<PlaceholderPage title="My Day" />} />
          <Route path="inbox" element={<PlaceholderPage title="Inbox" />} />
          <Route path="tasks" element={<PlaceholderPage title="All Tasks" />} />
          <Route path="projects" element={<PlaceholderPage title="Projects" />} />
          <Route path="calendar" element={<PlaceholderPage title="Calendar" />} />
          <Route path="habits" element={<PlaceholderPage title="Habits" />} />
          <Route path="goals" element={<PlaceholderPage title="Goals" />} />
          <Route path="notes" element={<PlaceholderPage title="Notes" />} />
          <Route path="analytics" element={<PlaceholderPage title="Analytics" />} />
          <Route path="archive" element={<PlaceholderPage title="Archive" />} />
          <Route path="widgets" element={<PlaceholderPage title="Widget Center" />} />
          <Route path="settings" element={<PlaceholderPage title="Settings" />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
};
