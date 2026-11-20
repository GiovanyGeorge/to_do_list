import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Bell, Minus, Square, Copy, X, Languages } from "lucide-react";
import { setAppLanguage } from "@/locales/i18n";
import { useAppStore } from "@/store/useAppStore";
import { useNotificationStore } from "@/store/useNotificationStore";
import { QuickAddModal } from "../tasks/QuickAddModal";
import { CommandPalette } from "../search/CommandPalette";
import { NotificationDrawer } from "../notifications/NotificationDrawer";

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setLanguage } = useAppStore();
  const { notifications, fetchNotifications } = useNotificationStore();
  const [isMaximized, setIsMaximized] = useState(false);
  const [isQuickAddOpen, setIsQuickAddOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

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

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl+K or Cmd+K: Open Search Command Palette
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setIsSearchOpen((prev) => !prev);
      }
      // Ctrl+N or Cmd+N: Open Quick Add
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

  return (
    <>
      <header className="h-16 border-b border-border-subtle bg-background flex items-center justify-between px-6 titlebar-drag-region select-none">
        {/* Global Search Bar */}
        <div className="flex-1 max-w-md titlebar-no-drag">
          <div
            onClick={() => setIsSearchOpen(true)}
            className="relative cursor-pointer group"
          >
            <Search className="w-4 h-4 text-text-muted group-hover:text-accent absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none transition-colors" />
            <div className="w-full h-9 pl-9 pr-12 rtl:pl-12 rtl:pr-9 rounded-lg bg-background-elevated/70 border border-border-subtle text-xs text-text-muted flex items-center justify-between group-hover:border-accent transition-colors">
              <span>{t("header.searchPlaceholder")}</span>
              <kbd className="hidden sm:inline-block px-1.5 py-0.5 text-[10px] font-semibold text-text-muted bg-background-card rounded border border-border-subtle">
                Ctrl K
              </kbd>
            </div>
          </div>
        </div>

        {/* Header Actions & Window Controls */}
        <div className="flex items-center gap-3 titlebar-no-drag">
          {/* Quick Add Button */}
          <button
            onClick={() => setIsQuickAddOpen(true)}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-background font-medium text-xs hover:bg-accent-hover transition-colors shadow-sm active:scale-95"
            title={t("header.quickAdd")}
          >
            <Plus className="w-4 h-4" />
            <span>{t("header.quickAdd")}</span>
          </button>

          {/* Language switch */}
          <button
            onClick={handleLanguageToggle}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-background-elevated/60 hover:bg-background-elevated text-xs text-text-secondary hover:text-text-primary border border-border-subtle transition-colors"
            title={t("settings.language")}
          >
            <Languages className="w-4 h-4 text-accent" />
            <span>{i18n.language === "ar" ? "English" : "العربية"}</span>
          </button>

          {/* Notifications */}
          <button
            onClick={() => setIsNotificationsOpen(true)}
            className="p-2 rounded-lg bg-background-elevated/60 hover:bg-background-elevated text-text-secondary hover:text-text-primary border border-border-subtle transition-colors relative"
            title={t("header.notifications")}
          >
            <Bell className="w-4 h-4" />
            {notifications.length > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
            )}
          </button>

          <div className="w-px h-5 bg-border-subtle mx-1" />

          {/* Windows Titlebar Controls */}
          <div className="flex items-center">
            <button
              onClick={handleMinimize}
              className="p-2 hover:bg-background-elevated rounded text-text-secondary hover:text-text-primary transition-colors"
              title={t("common.minimize")}
            >
              <Minus className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={handleMaximize}
              className="p-2 hover:bg-background-elevated rounded text-text-secondary hover:text-text-primary transition-colors"
              title={isMaximized ? t("common.restore") : t("common.maximize")}
            >
              {isMaximized ? (
                <Copy className="w-3.5 h-3.5" />
              ) : (
                <Square className="w-3.5 h-3.5" />
              )}
            </button>
            <button
              onClick={handleClose}
              className="p-2 hover:bg-red-600/80 rounded text-text-secondary hover:text-white transition-colors"
              title={t("common.close")}
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
