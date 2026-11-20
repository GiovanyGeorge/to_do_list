import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Search, Plus, Bell, Minus, Square, Copy, X, Languages } from "lucide-react";
import { setAppLanguage } from "@/locales/i18n";
import { useAppStore } from "@/store/useAppStore";

export const Header: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { setLanguage } = useAppStore();
  const [isMaximized, setIsMaximized] = useState(false);

  useEffect(() => {
    if (window.electronAPI) {
      window.electronAPI.isMaximized().then(setIsMaximized);
      const unsubscribe = window.electronAPI.onWindowStateChange((maximized) => {
        setIsMaximized(maximized);
      });
      return unsubscribe;
    }
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
    <header className="h-16 border-b border-border-subtle bg-background flex items-center justify-between px-6 titlebar-drag-region select-none">
      {/* Global Search Bar */}
      <div className="flex-1 max-w-md titlebar-no-drag">
        <div className="relative">
          <Search className="w-4 h-4 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="text"
            placeholder={t("header.searchPlaceholder")}
            className="w-full h-9 pl-9 pr-4 rtl:pl-4 rtl:pr-9 rounded-lg bg-background-elevated/70 border border-border-subtle text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>
      </div>

      {/* Header Actions & Window Controls */}
      <div className="flex items-center gap-3 titlebar-no-drag">
        {/* Quick Add Button */}
        <button
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-accent text-background font-medium text-xs hover:bg-accent-hover transition-colors shadow-sm"
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
          className="p-2 rounded-lg bg-background-elevated/60 hover:bg-background-elevated text-text-secondary hover:text-text-primary border border-border-subtle transition-colors relative"
          title={t("header.notifications")}
        >
          <Bell className="w-4 h-4" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-accent" />
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
            {isMaximized ? <Copy className="w-3.5 h-3.5" /> : <Square className="w-3.5 h-3.5" />}
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
  );
};
