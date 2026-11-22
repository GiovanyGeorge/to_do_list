import React from "react";
import { NavLink, useLocation } from "react-router-dom";
import { useTranslation } from "react-i18next";
import { motion, AnimatePresence } from "motion/react";
import {
  LayoutGrid,
  Sun,
  Calendar,
  CheckCircle2,
  Folder,
  FolderKanban,
  Sparkles,
  Target,
  FileText,
  BarChart3,
  Archive,
  Settings,
  ChevronLeft,
  ChevronRight,
  CheckCheck,
} from "lucide-react";
import { useAppStore } from "@/store/useAppStore";
import { useTaskStore } from "@/store/useTaskStore";
import { useMotion } from "@/hooks/useMotion";
import { useSoundManager } from "@/hooks/useSoundManager";
import clsx from "clsx";

export const Sidebar: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { sidebarCollapsed, toggleSidebar } = useAppStore();
  const { tasks } = useTaskStore();
  const isRtl = i18n.dir() === "rtl";
  const location = useLocation();
  const { enabled } = useMotion();
  const { playSound } = useSoundManager();

  // Priority counts for open (not done) tasks - single-pass memoized
  const { highCount, mediumCount, lowCount } = React.useMemo(() => {
    let high = 0;
    let medium = 0;
    let low = 0;
    for (const t of tasks) {
      if (t.status === "done") continue;
      if (t.priority === "high" || t.priority === "urgent") high++;
      else if (t.priority === "medium") medium++;
      else if (t.priority === "low") low++;
    }
    return { highCount: high, mediumCount: medium, lowCount: low };
  }, [tasks]);

  const primaryNavigation = [
    { name: t("nav.dashboard") || "Dashboard", href: "/", icon: LayoutGrid },
    { name: t("nav.today") || "Today", href: "/my-day", icon: Sun },
    { name: t("nav.upcoming") || "Upcoming", href: "/calendar", icon: Calendar },
    { name: t("nav.completed") || "Completed", href: "/tasks", icon: CheckCircle2 },
  ];

  const secondaryNavigation = [
    { name: t("nav.categories") || "Categories", href: "/categories", icon: Folder },
    { name: t("nav.projects") || "Projects", href: "/projects", icon: FolderKanban },
    { name: t("nav.habits") || "Habits", href: "/habits", icon: Sparkles },
    { name: t("nav.goals") || "Goals", href: "/goals", icon: Target },
    { name: t("nav.notes") || "Notes", href: "/notes", icon: FileText },
    { name: t("nav.analytics") || "Analytics", href: "/analytics", icon: BarChart3 },
    { name: t("nav.archive") || "Archive", href: "/archive", icon: Archive },
  ];

  const isActive = (href: string) =>
    href === "/"
      ? location.pathname === "/"
      : location.pathname.startsWith(href);

  return (
    <motion.aside
      animate={{ width: sidebarCollapsed ? 76 : 240 }}
      transition={enabled ? { duration: 0.28, ease: [0.2, 0.8, 0.2, 1] } : { duration: 0 }}
      className="flex flex-col border-r border-[rgba(28,25,23,0.08)] bg-[#FAF7F2] relative overflow-hidden select-none shrink-0"
      style={{ willChange: "width" }}
    >
      {/* 1. Logo & Brand Tile */}
      <div className="flex items-center h-16 px-5 border-b border-[rgba(28,25,23,0.06)] titlebar-drag-region">
        <div className="flex items-center gap-3">
          {/* 36px gradient tile with double check icon */}
          <div className="w-9 h-9 rounded-xl bg-accent-gradient flex items-center justify-center text-[#FFFBEB] shadow-glow shrink-0">
            <CheckCheck className="w-5 h-5 stroke-[2.5]" />
          </div>
          <AnimatePresence mode="wait">
            {!sidebarCollapsed && (
              <motion.div
                className="flex items-baseline overflow-hidden whitespace-nowrap font-sora"
                initial={{ opacity: 0, width: 0 }}
                animate={{ opacity: 1, width: "auto" }}
                exit={{ opacity: 0, width: 0 }}
                transition={enabled ? { duration: 0.2 } : { duration: 0 }}
              >
                <span className="font-bold text-[#1C1917] tracking-tight text-lg">
                  Life
                </span>
                <span className="font-bold text-accent-gradient tracking-tight text-lg">
                  Flow
                </span>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* 2. Main Navigation List */}
      <div className="flex-1 overflow-y-auto py-5 px-3 space-y-1">
        {primaryNavigation.map((item) => {
          const active = isActive(item.href);
          return (
            <NavLink
              key={item.href}
              to={item.href}
              title={sidebarCollapsed ? item.name : undefined}
              onClick={() => playSound("navigation")}
              className={clsx(
                "relative flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium transition-all group",
                active
                  ? "bg-accent-gradient text-[#FFFBEB] font-semibold shadow-glow"
                  : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F0EAE0]",
                sidebarCollapsed && "justify-center px-0"
              )}
            >
              <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
              <AnimatePresence mode="wait">
                {!sidebarCollapsed && (
                  <motion.span
                    className="whitespace-nowrap font-sans text-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.15 }}
                  >
                    {item.name}
                  </motion.span>
                )}
              </AnimatePresence>
            </NavLink>
          );
        })}

        {/* Priority Counts Card (when expanded) */}
        <AnimatePresence>
          {!sidebarCollapsed && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="pt-4 pb-2"
            >
              <div className="px-3 py-3 rounded-2xl bg-[#FFFFFF] border border-[rgba(28,25,23,0.08)] shadow-soft-card">
                <span className="text-[11px] font-semibold text-[#78716C] uppercase tracking-wider block mb-2.5 px-1 font-sora">
                  Open by priority
                </span>
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] text-xs font-medium text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#B91C1C]" />
                      <span>High</span>
                    </div>
                    <span className="font-sora font-semibold text-[11px] text-[#78716C] tabular-nums">
                      {highCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] text-xs font-medium text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#C2410C]" />
                      <span>Medium</span>
                    </div>
                    <span className="font-sora font-semibold text-[11px] text-[#78716C] tabular-nums">
                      {mediumCount}
                    </span>
                  </div>

                  <div className="flex items-center justify-between px-2.5 py-1.5 rounded-lg bg-[#FAF7F2] text-xs font-medium text-[#1C1917]">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-[#15803D]" />
                      <span>Low</span>
                    </div>
                    <span className="font-sora font-semibold text-[11px] text-[#78716C] tabular-nums">
                      {lowCount}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Secondary Modules Divider */}
        {!sidebarCollapsed && (
          <div className="pt-2 pb-1 px-3">
            <span className="text-[10px] font-semibold text-[#A8A29E] uppercase tracking-wider font-sora">
              More
            </span>
          </div>
        )}

        {/* Secondary Navigation */}
        <div className="space-y-0.5">
          {secondaryNavigation.map((item) => {
            const active = isActive(item.href);
            return (
              <NavLink
                key={item.href}
                to={item.href}
                title={sidebarCollapsed ? item.name : undefined}
                onClick={() => playSound("navigation")}
                className={clsx(
                  "flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-medium transition-all group",
                  active
                    ? "bg-[#F0EAE0] text-[#C2410C] font-semibold"
                    : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F0EAE0]/70",
                  sidebarCollapsed && "justify-center px-0"
                )}
              >
                <item.icon className="w-4 h-4 shrink-0 transition-transform group-hover:scale-105" />
                {!sidebarCollapsed && (
                  <span className="truncate">{item.name}</span>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* 3. Footer Settings & Collapse */}
      <div className="p-3 border-t border-[rgba(28,25,23,0.06)] flex flex-col gap-1.5">
        <NavLink
          to="/settings"
          title={sidebarCollapsed ? t("nav.settings") || "Settings" : undefined}
          onClick={() => playSound("navigation")}
          className={({ isActive: active }) =>
            clsx(
              "flex items-center gap-3 px-3 py-2 rounded-xl text-xs font-medium transition-colors",
              active
                ? "bg-[#F0EAE0] text-[#C2410C] font-semibold"
                : "text-[#78716C] hover:text-[#1C1917] hover:bg-[#F0EAE0]",
              sidebarCollapsed && "justify-center px-0"
            )
          }
        >
          <Settings className="w-4 h-4 shrink-0" />
          {!sidebarCollapsed && <span>{t("nav.settings") || "Settings"}</span>}
        </NavLink>

        <button
          onClick={toggleSidebar}
          aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          className="flex items-center justify-center p-2 rounded-xl text-[#78716C] hover:text-[#1C1917] hover:bg-[#F0EAE0] transition-colors w-full"
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
