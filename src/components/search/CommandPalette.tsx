import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import {
  Search,
  CheckSquare,
  FolderKanban,
  FileText,
  Calendar,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { Modal } from "../ui/Modal";

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [query, setQuery] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setQuery("");
    }
  }, [isOpen]);

  const quickLinks = [
    { label: t("nav.dashboard"), path: "/", icon: Calendar },
    { label: t("nav.myDay"), path: "/my-day", icon: Calendar },
    { label: t("nav.inbox"), path: "/inbox", icon: CheckSquare },
    { label: t("nav.allTasks"), path: "/tasks", icon: CheckSquare },
    { label: t("nav.projects"), path: "/projects", icon: FolderKanban },
    { label: t("nav.calendar"), path: "/calendar", icon: Calendar },
    { label: t("nav.habits"), path: "/habits", icon: Sparkles },
    { label: t("nav.notes"), path: "/notes", icon: FileText },
  ];

  const filteredLinks = quickLinks.filter((item) =>
    item.label.toLowerCase().includes(query.toLowerCase())
  );

  const handleSelect = (path: string) => {
    navigate(path);
    onClose();
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} maxWidth="lg">
      <div className="space-y-4">
        <div className="relative">
          <Search className="w-5 h-5 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
          <input
            autoFocus
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={t("header.searchPlaceholder")}
            className="w-full h-12 pl-10 pr-4 rtl:pl-4 rtl:pr-10 rounded-xl bg-background-elevated border border-border-subtle text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:border-accent transition-colors"
          />
        </div>

        <div className="space-y-1 max-h-64 overflow-y-auto pt-2">
          <p className="text-[11px] font-semibold text-text-muted uppercase tracking-wider px-2 mb-2">
            Navigation
          </p>
          {filteredLinks.length === 0 ? (
            <div className="py-6 text-center text-xs text-text-secondary">
              No results found for "{query}"
            </div>
          ) : (
            filteredLinks.map((item) => (
              <button
                key={item.path}
                onClick={() => handleSelect(item.path)}
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-sm text-text-secondary hover:text-text-primary hover:bg-background-elevated/80 transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4 text-text-muted group-hover:text-accent transition-colors" />
                  <span>{item.label}</span>
                </div>
                <ArrowRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all opacity-0 group-hover:opacity-100" />
              </button>
            ))
          )}
        </div>
      </div>
    </Modal>
  );
};
