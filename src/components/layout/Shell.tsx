import React from "react";
import { Outlet, useLocation } from "react-router-dom";
import { AnimatePresence } from "motion/react";
import { Toaster } from "sonner";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { AnimatedPage } from "./AnimatedPage";

export const Shell: React.FC = () => {
  const location = useLocation();

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-background text-text-primary select-none">
      <Sidebar />
      <div className="flex flex-col flex-1 min-w-0 h-full overflow-hidden">
        <Header />
        <main className="flex-1 overflow-y-auto p-6 bg-background relative">
          <AnimatePresence mode="wait">
            <AnimatedPage key={location.pathname}>
              <Outlet />
            </AnimatedPage>
          </AnimatePresence>
        </main>
      </div>

      {/* Global toast notifications */}
      <Toaster
        theme="light"
        position="bottom-right"
        toastOptions={{
          style: {
            background: "#FFFFFF",
            border: "1px solid rgba(28, 25, 23, 0.12)",
            color: "#1C1917",
            fontFamily: "'Plus Jakarta Sans', Cairo, system-ui, sans-serif",
            borderRadius: "16px",
            boxShadow: "0 1px 2px rgba(28,25,23,.05), 0 14px 30px -20px rgba(28,25,23,.24)",
          },
        }}
        richColors
        closeButton
        duration={4000}
      />
    </div>
  );
};
