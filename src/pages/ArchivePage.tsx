import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Archive,
  RotateCcw,
  Trash2,
  Search,
  Folder,
  CheckSquare,
  Sparkles,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { Card } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import type { ArchivedItem } from "../../database/repositories/archiveRepository";

type FilterType = "all" | "task" | "project" | "habit" | "note";

export const ArchivePage: React.FC = () => {
  const { t } = useTranslation();
  const [items, setItems] = useState<ArchivedItem[]>([]);
  const [activeTab, setActiveTab] = useState<FilterType>("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [loading, setLoading] = useState(true);
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);

  const fetchArchived = async () => {
    setLoading(true);
    try {
      if (window.electronAPI?.listArchived) {
        const res = await window.electronAPI.listArchived();
        setItems(res || []);
      }
    } catch (err) {
      console.error("Failed to load archived items:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchArchived();
  }, []);

  const handleRestore = async (item: ArchivedItem) => {
    if (!window.electronAPI?.restoreArchived) return;
    try {
      await window.electronAPI.restoreArchived(item.type, item.id);
      fetchArchived();
    } catch (err) {
      console.error("Failed to restore item:", err);
    }
  };

  const handleDeletePermanently = async (item: ArchivedItem) => {
    if (!window.electronAPI?.deleteArchivedPermanently) return;
    try {
      await window.electronAPI.deleteArchivedPermanently(item.type, item.id);
      setConfirmDeleteId(null);
      fetchArchived();
    } catch (err) {
      console.error("Failed to permanently delete item:", err);
    }
  };

  const filteredItems = items.filter((item) => {
    const matchesTab = activeTab === "all" || item.type === activeTab;
    const matchesSearch = item.title
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type: ArchivedItem["type"]) => {
    switch (type) {
      case "task":
        return <CheckSquare className="w-4 h-4 text-accent" />;
      case "project":
        return <Folder className="w-4 h-4 text-[#D97706]" />;
      case "habit":
        return <Sparkles className="w-4 h-4 text-[#7C3AED]" />;
      case "note":
        return <FileText className="w-4 h-4 text-[#15803D]" />;
      default:
        return <Archive className="w-4 h-4 text-text-muted" />;
    }
  };

  const getTypeBadgeVariant = (type: ArchivedItem["type"]) => {
    switch (type) {
      case "task":
        return "accent";
      case "project":
        return "warning";
      case "habit":
        return "default";
      case "note":
        return "success";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-sm">
            <Archive className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.archive") || "Archive"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Review, restore, or permanently remove archived tasks, projects, habits, and notes.
            </p>
          </div>
        </div>
        <Button variant="secondary" size="sm" onClick={fetchArchived} disabled={loading}>
          <RotateCcw className={`w-3.5 h-3.5 mr-1.5 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-[0_1px_2px_rgba(28,25,23,0.04)]">
        <div className="flex items-center gap-1.5 p-1 bg-background-elevated rounded-xl border border-[rgba(28,25,23,0.08)] overflow-x-auto">
          {(["all", "task", "project", "habit", "note"] as FilterType[]).map(
            (tab) => {
              const count =
                tab === "all"
                  ? items.length
                  : items.filter((i) => i.type === tab).length;
              const label =
                tab === "all"
                  ? "All"
                  : tab === "task"
                  ? "Tasks"
                  : tab === "project"
                  ? "Projects"
                  : tab === "habit"
                  ? "Habits"
                  : "Notes";

              return (
                <button
                  key={tab}
                  onClick={() => setActiveTab(tab)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === tab
                      ? "bg-white text-text-primary shadow-sm font-sora"
                      : "text-text-secondary hover:text-text-primary"
                  }`}
                >
                  {label}
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono ${
                      activeTab === tab
                        ? "bg-accent/15 text-accent font-bold"
                        : "bg-background-elevated text-text-muted"
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            }
          )}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter archived items..."
            className="w-full bg-background-elevated/70 border border-[rgba(28,25,23,0.08)] rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent focus:bg-white rtl:pl-3 rtl:pr-9 transition-colors"
          />
        </div>
      </div>

      {/* Item List */}
      {loading ? (
        <div className="text-center py-20 text-text-muted text-xs flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4 animate-spin text-accent" />
          Loading archived items...
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="py-16 bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
          <EmptyState
            title="No Archived Items"
            description="Items archived from tasks, projects, habits, or notes will show up here."
            icon={<Archive className="w-10 h-10 text-accent" />}
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="group p-4 rounded-xl bg-white border border-[rgba(28,25,23,0.08)] shadow-[0_1px_2px_rgba(28,25,23,0.04)] hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="p-2.5 rounded-xl bg-background-elevated border border-[rgba(28,25,23,0.08)] shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm font-sora text-text-primary truncate">
                      {item.title}
                    </span>
                    <Badge variant={getTypeBadgeVariant(item.type)} size="sm">
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5 font-mono">
                    Archived on {new Date(item.archivedAt).toLocaleDateString()}{" "}
                    at{" "}
                    {new Date(item.archivedAt).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2 shrink-0">
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => handleRestore(item)}
                  title="Restore back to active state"
                >
                  <RotateCcw className="w-3.5 h-3.5 mr-1" />
                  Restore
                </Button>

                {confirmDeleteId === item.id ? (
                  <div className="flex items-center gap-1.5">
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => handleDeletePermanently(item)}
                      title="Confirm permanent deletion"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1" />
                      Confirm Delete
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmDeleteId(null)}
                    >
                      Cancel
                    </Button>
                  </div>
                ) : (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-text-muted hover:text-status-danger hover:bg-status-danger/10"
                    onClick={() => setConfirmDeleteId(item.id)}
                    title="Permanently delete item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
