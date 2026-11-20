import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Plus, Pin, Trash2, Search } from "lucide-react";
import { useNoteStore } from "@/store/useNoteStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import type { NoteWithTags } from "@shared/types/database";

const NOTE_COLORS = [
  "#FFFFFF", // Pure white
  "#FDF4EC", // Warm cream/terracotta tint
  "#F0FDF4", // Soft sage green
  "#FAF5FF", // Soft lavender
  "#FFFBEB", // Soft warm amber
  "#F1F5F9", // Soft slate
];

export const NotesPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    notes,
    fetchNotes,
    createNote,
    togglePin,
    deleteNote,
    search,
    setSearch,
  } = useNoteStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [color, setColor] = useState(NOTE_COLORS[0]);

  useEffect(() => {
    fetchNotes(search);
  }, [fetchNotes, search]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    await createNote({
      title: title.trim(),
      content: content.trim() || undefined,
      color,
    });

    setTitle("");
    setContent("");
    setColor(NOTE_COLORS[0]);
    setIsCreateOpen(false);
  };

  const pinnedNotes = notes.filter((n) => n.is_pinned === 1);
  const otherNotes = notes.filter((n) => n.is_pinned !== 1);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-sm">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.notes") || "Notes"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Personal thoughts, quick memos, meeting minutes, and study summaries.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="relative min-w-[200px]">
            <Search className="w-4 h-4 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search notes..."
              className="w-full h-9 pl-9 pr-3 rtl:pl-3 rtl:pr-9 rounded-xl bg-background-elevated/70 text-xs text-text-primary placeholder:text-text-muted border border-[rgba(28,25,23,0.08)] focus:outline-none focus:border-accent focus:bg-white transition-colors"
            />
          </div>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Note
          </Button>
        </div>
      </div>

      {notes.length === 0 ? (
        <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card flex flex-col items-center">
          <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-text-muted mb-3">
            <FileText className="w-6 h-6 text-accent" />
          </div>
          <h3 className="text-sm font-semibold font-sora text-text-primary mb-1">
            No notes written yet
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mb-4">
            Capture quick reference thoughts, study outlines, and daily reflections offline.
          </p>
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
          >
            Write First Note
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-bold font-sora text-text-muted uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5 text-accent" />
                <span>Pinned</span>
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {pinnedNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPinToggle={() => togglePin(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
              </div>
            </div>
          )}

          {/* All Other Notes */}
          {otherNotes.length > 0 && (
            <div className="space-y-3">
              {pinnedNotes.length > 0 && (
                <h2 className="text-xs font-bold font-sora text-text-muted uppercase tracking-wider px-1">
                  Other Notes
                </h2>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {otherNotes.map((note) => (
                  <NoteCard
                    key={note.id}
                    note={note}
                    onPinToggle={() => togglePin(note.id)}
                    onDelete={() => deleteNote(note.id)}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Create Note Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Note"
        description="Write notes with local offline persistence."
        maxWidth="lg"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Note title"
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Card Color
            </label>
            <div className="flex items-center gap-2">
              {NOTE_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border border-[rgba(28,25,23,0.18)] transition-all ${
                    color === c
                      ? "scale-110 ring-2 ring-accent shadow-sm"
                      : "opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your thoughts, outlines, or checklist..."
            rows={8}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(28,25,23,0.08)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsCreateOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Note
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};

const NoteCard: React.FC<{
  note: NoteWithTags;
  onPinToggle: () => void;
  onDelete: () => void;
}> = ({ note, onPinToggle, onDelete }) => {
  return (
    <div
      style={{ backgroundColor: note.color || "#FFFFFF" }}
      className="p-5 rounded-2xl border border-[rgba(28,25,23,0.08)] hover:shadow-card hover:-translate-y-0.5 transition-all duration-200 flex flex-col justify-between group shadow-[0_1px_2px_rgba(28,25,23,0.04)]"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-bold font-sora text-text-primary tracking-tight line-clamp-1">
            {note.title}
          </h3>
          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={onPinToggle}
              className={`p-1.5 rounded-lg hover:bg-background-elevated transition-colors ${
                note.is_pinned ? "text-accent" : "text-text-muted"
              }`}
              title={note.is_pinned ? "Unpin" : "Pin"}
            >
              <Pin className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onDelete}
              className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
              title="Delete note"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {note.content && (
          <p className="text-xs text-text-secondary line-clamp-6 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[rgba(28,25,23,0.06)] mt-4 text-[10px] text-text-muted font-mono flex items-center justify-between">
        <span>
          {new Intl.DateTimeFormat(undefined, {
            month: "short",
            day: "numeric",
          }).format(new Date(note.updated_at))}
        </span>
        {note.is_pinned === 1 && (
          <span className="text-[10px] font-semibold text-accent">Pinned</span>
        )}
      </div>
    </div>
  );
};
