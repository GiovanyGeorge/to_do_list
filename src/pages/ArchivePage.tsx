import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Archive, RotateCcw, Trash2, Search, Folder, CheckSquare, Sparkles, FileText } from "lucide-react";
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
    const matchesSearch = item.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesTab && matchesSearch;
  });

  const getTypeIcon = (type: ArchivedItem["type"]) => {
    switch (type) {
      case "task":
        return <CheckSquare className="w-4 h-4 text-brand-purple" />;
      case "project":
        return <Folder className="w-4 h-4 text-brand-blue" />;
      case "habit":
        return <Sparkles className="w-4 h-4 text-priority-urgent" />;
      case "note":
        return <FileText className="w-4 h-4 text-priority-low" />;
      default:
        return <Archive className="w-4 h-4 text-text-muted" />;
    }
  };

  const getTypeBadgeVariant = (type: ArchivedItem["type"]) => {
    switch (type) {
      case "task":
        return "default";
      case "project":
        return "accent";
      case "habit":
        return "warning";
      case "note":
        return "neutral";
      default:
        return "neutral";
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-text-primary flex items-center gap-2">
            <Archive className="w-6 h-6 text-brand-purple" />
            {t("nav.archive")}
          </h1>
          <p className="text-sm text-text-secondary mt-1">
            Review, restore, or permanently remove archived tasks, projects, habits, and notes.
          </p>
        </div>
        <Button variant="secondary" onClick={fetchArchived} disabled={loading}>
          <RotateCcw className={`w-4 h-4 mr-2 ${loading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Tabs and Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 p-1 bg-background-card rounded-xl border border-border-subtle overflow-x-auto">
          {(["all", "task", "project", "habit", "note"] as FilterType[]).map((tab) => {
            const count = tab === "all" ? items.length : items.filter((i) => i.type === tab).length;
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
                    ? "bg-brand-purple text-white shadow-sm"
                    : "text-text-secondary hover:text-text-primary hover:bg-background-elevated"
                }`}
              >
                {label}
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    activeTab === tab ? "bg-white/20 text-white" : "bg-background-elevated text-text-muted"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        <div className="relative min-w-[240px]">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-text-muted rtl:left-auto rtl:right-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Filter archived items..."
            className="w-full bg-background-card border border-border-subtle rounded-xl pl-9 pr-3 py-1.5 text-xs text-text-primary placeholder:text-text-muted focus:outline-none focus:border-brand-purple rtl:pl-3 rtl:pr-9"
          />
        </div>
      </div>

      {/* Item List */}
      {loading ? (
        <div className="text-center py-16 text-text-muted text-sm flex items-center justify-center gap-2">
          <RotateCcw className="w-4 h-4 animate-spin" />
          Loading archived items...
        </div>
      ) : filteredItems.length === 0 ? (
        <Card className="py-12">
          <EmptyState
            title="No Archived Items"
            description="Items archived from tasks, projects, habits, or notes will show up here."
            icon={<Archive className="w-10 h-10 text-text-muted" />}
          />
        </Card>
      ) : (
        <div className="space-y-2.5">
          {filteredItems.map((item) => (
            <div
              key={`${item.type}-${item.id}`}
              className="group p-4 rounded-xl bg-background-card border border-border-subtle hover:border-brand-purple/40 transition-all flex items-center justify-between gap-4"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="p-2 rounded-lg bg-background-elevated border border-border-subtle shrink-0">
                  {getTypeIcon(item.type)}
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-semibold text-sm text-text-primary truncate">
                      {item.title}
                    </span>
                    <Badge variant={getTypeBadgeVariant(item.type)} size="sm">
                      {item.type.toUpperCase()}
                    </Badge>
                  </div>
                  <div className="text-xs text-text-muted mt-0.5">
                    Archived on {new Date(item.archivedAt).toLocaleDateString()} at{" "}
                    {new Date(item.archivedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
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
                    className="text-text-muted hover:text-priority-urgent hover:bg-priority-urgent/10"
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