import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutDashboard,
  Sun,
  Inbox,
  CheckSquare,
  FolderKanban,
  Calendar,
  Sparkles,
  Target,
  FileText,
  BarChart3,
  Archive,
  LayoutGrid,
  Settings,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";
import clsx from "clsx";

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const isRtl = i18n.dir() === "rtl";
  const location = useLocation();
  const { enabled } = useMotion();
  const { playSound } = useSoundManager();

  const navigation = [
    { name: t("nav.dashboard"), href: "/", icon: LayoutDashboard },
    { name: t("nav.myDay"), href: "/my-day", icon: Sun },
    { name: t("nav.inbox"), href: "/inbox", icon: Inbox },
    { name: t("nav.allTasks"), href: "/tasks", icon: CheckSquare },
    { name: t("nav.projects"), href: "/projects", icon: FolderKanban },
    { name: t("nav.calendar"), href: "/calendar", icon: Calendar },
    { name: t("nav.habits"), href: "/habits", icon: Sparkles },
    { name: t("nav.goals"), href: "/goals", icon: Target },
    { name: t("nav.notes"), href: "/notes", icon: FileText },
    { name: t("nav.analytics"), href: "/analytics", icon: BarChart3 },
    { name: t("nav.archive"), href: "/archive", icon: Archive },
    { name: t("nav.widgets"), href: "/widgets", icon: LayoutGrid },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 80 : 256 }}
      transition={enabled ? { duration: 0.28, ease: [0.16, 1, 0.3, 1] } : { duration: 0 }}
      className="flex flex-col border-r border-border-subtle bg-background-sidebar relative overflow-hidden"
      style={{ willChange: "width" }}
    >
      {/* Brand Header */}
      <div className="flex items-center h-16 px-4 border-b border-border-subtle titlebar-drag-region">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center text-background font-bold text-lg shadow-sm shrink-0">
            LF
          </div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                className="flex flex-col overflow-hidden whitespace-nowrap"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={enabled ? { duration: 0.22 } : { duration: 0 }}
              >
                <span className="font-semibold text-text-primary tracking-wide text-sm">
                  {t("app.title")}
                </span>
                <span className="text-[10px] text-text-secondary leading-tight truncate max-w-[140px]">
                  {t("app.subtitle")}
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Navigation links */}
      <div className="flex-1 overflow-y-auto py-4 px-2 space-y-1">
        {navigation.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={sidebarCollapsed ? item.name : undefined}
              onClick={() => playSound("navigation")}
              className={clsx(
                "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                active
                  ? "text-accent font-semibold"
                  : "text-text-secondary hover:text-text-primary hover:bg-background-elevated/50",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              {/* Animated active indicator */}
              {active && (
                <motion.div
                  layoutId={enabled ? "nav-active-indicator" : undefined}
                  className="absolute inset-0 rounded-lg bg-accent/15"
                  transition={enabled ? { type: "spring", stiffness: 350, damping: 30 } : { duration: 0 }}
                />
              )}
              <motion.div
                className="relative z-10 shrink-0"
                whileHover={enabled ? { scale: 1.1 } : undefined}
                whileTap={enabled ? { scale: 0.95 } : undefined}
                transition={{ duration: 0.15 }}
              >
                <item.icon className="w-5 h-5" />
              </motion.div>
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    className="relative z-10 whitespace-nowrap"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.14 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}
      </div>

      {/* Footer controls & Settings */}
      <div className="p-3 border-t border-border-subtle flex flex-col gap-2">
        <NavLink
          to="/settings"
          title={sidebarCollapsed ? t("nav.settings") : undefined}
          onClick={() => playSound("navigation")}
          className={({ isActive: active }) =>
            clsx(
              "relative flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
              active
                ? "text-accent font-semibold"
                : "text-text-secondary hover:text-text-primary hover:bg-background-elevated/50",
              sidebarCollapsed && "justify-center px-0"
            )
          }
        >
          {location.pathname === "/settings" && (
            <motion.div
              layoutId={enabled ? "nav-active-indicator" : undefined}
              className="absolute inset-0 rounded-lg bg-accent/15"
              transition={enabled ? { type: "spring", stiffness: 350, damping: 30 } : { duration: 0 }}
            />
          )}
          <Settings className="w-5 h-5 shrink-0 relative z-10" />
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.span
                className="relative z-10 whitespace-nowrap"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.14 }}
              >
                {t("nav.settings")}
              </motion.span>
            )}
          </AnimatePresence>
        </NavLink>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center p-2 rounded-lg text-text-secondary hover:text-text-primary hover:bg-background-elevated/50 transition-colors w-full"
        >
          {sidebarCollapsed ? (
            isRtl ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />
          ) : (
            isRtl ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />
          )}
        </button>
      </div>
    </motion.aside>
  );
};
