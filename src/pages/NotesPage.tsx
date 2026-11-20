import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FileText, Plus, Pin, Trash2, Search } from "lucide-react";
import { useNoteStore } from "@/store/useNoteStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import type { NoteWithTags } from "@shared/types/database";

const NOTE_COLORS = ["#191D24", "#1E293B", "#1C2D27", "#2C1B2A", "#2B261A"];

export const NotesPage: React.FC = () => {
  const { t } = useTranslation();
  const { notes, fetchNotes, createNote, togglePin, deleteNote, search, setSearch } =
    useNoteStore();

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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center">
            <FileText className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {t("nav.notes")}
            </h1>
            <p className="text-xs text-text-secondary">
              Personal thoughts, meeting minutes, and knowledge base
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
              className="w-full h-9 pl-9 pr-3 rtl:pl-3 rtl:pr-9 rounded-lg bg-background-elevated text-xs text-text-primary placeholder:text-text-muted border border-border-subtle focus:outline-none focus:border-accent"
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
        <div className="py-16 text-center rounded-2xl bg-background-card/50 border border-border-subtle flex flex-col items-center">
          <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
            <FileText className="w-6 h-6 text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-text-primary mb-1">
            No notes written yet
          </h3>
          <p className="text-xs text-text-secondary max-w-sm mb-4">
            Capture reference notes, study summaries, and meeting memos with markdown support.
          </p>
          <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
            Write First Note
          </Button>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Pinned Notes Section */}
          {pinnedNotes.length > 0 && (
            <div className="space-y-3">
              <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider flex items-center gap-1.5 px-1">
                <Pin className="w-3.5 h-3.5" />
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
                <h2 className="text-xs font-semibold text-text-muted uppercase tracking-wider px-1">
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
        description="Write notes with local persistence."
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

          <Textarea
            label="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Type your note content..."
            rows={8}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle/50">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
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
      style={{ backgroundColor: note.color || "#191D24" }}
      className="p-5 rounded-2xl border border-border-subtle hover:border-accent/40 transition-all flex flex-col justify-between group shadow-sm"
    >
      <div>
        <div className="flex items-start justify-between gap-2 mb-2">
          <h3 className="text-sm font-semibold text-text-primary tracking-tight line-clamp-1">
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
              className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-background-elevated transition-colors"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {note.content && (
          <p className="text-xs text-text-secondary line-clamp-5 whitespace-pre-wrap leading-relaxed">
            {note.content}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-border-subtle/40 mt-4 text-[10px] text-text-muted">
        Updated{" "}
        {new Intl.DateTimeFormat(undefined, {
          month: "short",
          day: "numeric",
        }).format(new Date(note.updated_at))}
      </div>
    </div>
  );
};
