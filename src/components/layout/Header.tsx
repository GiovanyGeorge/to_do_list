import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useLocation } from "react-router-dom";
import { Search, Plus, Bell, Minus, Square, Copy, X, Languages } from "lucide-react";
import { setAppLanguage } from "@/locales/i18n";
import { useAppStore } from "@/store/useAppStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { QuickAddModal } from "../tasks/QuickAddModal";
import { CommandPalette } from "../search/CommandPalette";
import { NotificationDrawer } from "../notifications/NotificationDrawer";

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const location = useLocation();
  const { setLanguage } = useAppStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [currentTime, setCurrentTime] = useState("");

  useEffect(() => {
    fetchNotifications();
    if (window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized);
      const unsubscribe = window.electronAPI.onWindowStateChange((maximized) => {
        setIsMaximized(maximized);
      });
      return unsubscribe;
    }
  }, [fetchNotifications]);

  // Live Clock (Tabular numbers)
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(
        now.toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      );
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "n") {
        e.preventDefault();
        setIsQuickAddOpen(true);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleLanguageToggle = () => {
    const nextLang = i18n.language === "ar" ? "en" : "ar";
    setAppLanguage(nextLang);
    setLanguage(nextLang);
  };

  const handleMinimize = () => window.electronAPI?.minimizeWindow();
  const handleMaximize = () => window.electronAPI?.maximizeWindow();
  const handleClose = () => window.electronAPI?.closeWindow();

  // Page title mapping
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/my-day") return "Today";
    if (path === "/calendar") return "Upcoming";
    if (path === "/tasks") return "All Tasks";
    if (path === "/categories") return "Categories";
    if (path === "/projects") return "Projects";
    if (path === "/habits") return "Habits";
    if (path === "/goals") return "Goals";
    if (path === "/notes") return "Notes";
    if (path === "/analytics") return "Analytics";
    if (path === "/archive") return "Archive";
    if (path === "/settings") return "Settings";
    return "LifeFlow";
  };

  const todayFormatted = new Intl.DateTimeFormat(undefined, {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date());

  return (
    <>
      <header className="h-18 min-h-[4.5rem] border-b border-[rgba(28,25,23,0.08)] bg-[#FAF7F2] flex items-center justify-between px-7 titlebar-drag-region select-none">
        {/* Left: Title above today's date */}
        <div className="flex flex-col titlebar-no-drag">
          <h1 className="text-xl font-bold font-sora text-[#1C1917] tracking-tight leading-tight">
            {getPageTitle()}
          </h1>
          <p className="text-xs text-[#78716C] font-medium mt-0.5">
            {todayFormatted}
          </p>
        </div>

        {/* Center: Live Tabular Clock */}
        <div className="hidden md:flex items-center justify-center font-sora font-semibold text-sm tabular-nums text-[#1C1917] bg-[#F0EAE0]/70 px-4 py-1.5 rounded-full border border-[rgba(28,25,23,0.06)] titlebar-no-drag">
          {currentTime || "--:--:--"}
        </div>

        {/* Right: Pill-shaped Search Bar + Actions */}
        <div className="flex items-center gap-3 titlebar-no-drag">
          {/* Pill-shaped Search Bar */}
          <div
            onClick={() => setIsSearchOpen(true)}
            className={`relative cursor-pointer transition-all duration-300 ease-out ${
              isSearchFocused ? "w-64" : "w-48 sm:w-56"
            }`}
          >
            <Search className="w-4 h-4 text-[#78716C] absolute top-1/2 -translate-y-1/2 left-3.5 rtl:left-auto rtl:right-3.5 pointer-events-none transition-colors" />
            <input
              type="text"
              readOnly
              placeholder={t("header.searchPlaceholder") || "Search..."}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              className="w-full h-9 pl-9 pr-12 rtl:pl-12 rtl:pr-9 rounded-full bg-[#F0EAE0] border border-transparent text-xs text-[#1C1917] placeholder-[#78716C] focus:bg-white focus:border-[#C2410C] focus:shadow-glow focus:outline-none transition-all cursor-pointer font-sans"
            />
            <kbd className="hidden sm:inline-block absolute top-1/2 -translate-y-1/2 right-3 rtl:right-auto rtl:left-3 px-1.5 py-0.5 text-[10px] font-semibold text-[#78716C] bg-[#FFFFFF] rounded-full border border-[rgba(28,25,23,0.1)] pointer-events-none font-sora">
              ⌘K
            </kbd>
          </div>

          {/* Quick Add Button (+) */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="w-9 h-9 rounded-full bg-accent-gradient text-[#FFFBEB] flex items-center justify-center shadow-glow hover:scale-105 active:scale-95 transition-all"
            title={t("header.quickAdd") || "Add task"}
          >
            <Plus className="w-4 h-4 stroke-[2.5]" />
          </button>

          {/* Language Toggle */}
          <button
            onClick={handleLanguageToggle}
            className="w-9 h-9 rounded-full bg-[#F0EAE0] hover:bg-[#E5DFD7] text-[#78716C] hover:text-[#1C1917] flex items-center justify-center transition-colors"
            title={t("settings.language") || "Language"}
          >
            <Languages className="w-4 h-4" />
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="w-9 h-9 rounded-full bg-[#F0EAE0] hover:bg-[#E5DFD7] text-[#78716C] hover:text-[#1C1917] flex items-center justify-center transition-colors relative"
            title={t("header.notifications") || "Notifications"}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-[#C2410C]" />
            )}
          </button>

          <div className="w-px h-5 bg-[rgba(28,25,23,0.12)] mx-0.5" />

          {/* Windows Titlebar Controls */}
          <div className="flex items-center gap-0.5">
            <button
              onClick={handleMinimize}
              className="p-1.5 hover:bg-[#F0EAE0] rounded-lg text-[#78716C] hover:text-[#1C1917] transition-colors"
              title={t("common.minimize") || "Minimize"}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-1.5 hover:bg-[#F0EAE0] rounded-lg text-[#78716C] hover:text-[#1C1917] transition-colors"
              title={isMaximized ? t("common.restore") || "Restore" : t("common.maximize") || "Maximize"}
            >
              {isMaximized ? (
                <Copy className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-1.5 hover:bg-[#B91C1C] rounded-lg text-[#78716C] hover:text-white transition-colors"
              title={t("common.close") || "Close"}
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Modals & Drawers */}
      <QuickAddModal
        isOpen={isQuickAddOpen}
        onClose={() => setIsQuickAddOpen(false)}
      />
      <CommandPalette
        isOpen={isSearchOpen}
        onClose={() => setIsSearchOpen(false)}
      />
      <NotificationDrawer
        isOpen={isNotificationsOpen}
        onClose={() => setIsNotificationsOpen(false)}
      />
    </>
  );
};
