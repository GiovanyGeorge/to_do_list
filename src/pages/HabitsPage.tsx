import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Sparkles,
  Plus,
  Flame,
  Check,
  Trash2,
  BookOpen,
  Search,
} from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { getTodayLocalDateString } from "@/lib/dateUtils";
import { Select } from "@/components/ui/Select";
import {
  STARTER_HABIT_LIBRARY,
  HABIT_LIBRARY_CATEGORIES,
  type HabitLibraryItem,
} from "@/data/habitLibrary";
import type { HabitFrequency } from "@shared/types/database";

const HABIT_COLORS = [
  "#C2410C", // Terracotta
  "#15803D", // Green
  "#7C3AED", // Purple
  "#EA580C", // Muted orange
  "#0D9488", // Teal
  "#E11D48", // Rose
];

export const HabitsPage: React.FC = () => {
  const { t } = useTranslation();
  const { habits, fetchHabits, createHabit, toggleHabitLog, deleteHabit } =
    useHabitStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [isLibraryOpen, setIsLibraryOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [color, setColor] = useState(HABIT_COLORS[0]);

  // Library filters
  const [libraryCategory, setLibraryCategory] = useState<string>("All");
  const [librarySearch, setLibrarySearch] = useState("");
  const [addedLibraryIds, setAddedLibraryIds] = useState<Set<string>>(new Set());

  const todayStr = getTodayLocalDateString();

  useEffect(() => {
    fetchHabits();
  }, [fetchHabits]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    await createHabit({
      name: name.trim(),
      description: description.trim() || undefined,
      frequency,
      color,
    });

    setName("");
    setDescription("");
    setColor(HABIT_COLORS[0]);
    setIsCreateOpen(false);
  };

  const handleAddFromLibrary = async (item: HabitLibraryItem) => {
    await createHabit({
      name: item.name,
      description: item.description,
      frequency: item.frequency,
      color: item.color,
    });
    setAddedLibraryIds((prev) => new Set(prev).add(item.id));
  };

  const filteredLibrary = STARTER_HABIT_LIBRARY.filter((item) => {
    if (libraryCategory !== "All" && item.category !== libraryCategory) {
      return false;
    }
    if (librarySearch.trim()) {
      const q = librarySearch.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-glow">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.habits") || "Habits"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Build calm daily routines, nurture healthy habits, and stay consistent.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <Button
            variant="secondary"
            size="sm"
            onClick={() => setIsLibraryOpen(true)}
            leftIcon={<BookOpen className="w-4 h-4 text-accent" />}
          >
            Explore Library
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Habit
          </Button>
        </div>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-accent mb-3">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold font-sora text-text-primary mb-1">
              No habits active yet
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-5">
              Choose from our curated habit library or create a custom routine tailored to your goals.
            </p>
            <div className="flex items-center gap-3">
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsLibraryOpen(true)}
                leftIcon={<BookOpen className="w-4 h-4" />}
              >
                Browse Habit Library
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                Create Custom
              </Button>
            </div>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 rounded-xl bg-white border border-[rgba(28,25,23,0.08)] shadow-[0_1px_2px_rgba(28,25,23,0.04)] flex items-center justify-between gap-4 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-center gap-3.5 min-w-0">
                {/* Circular check-in button */}
                <button
                  onClick={() => toggleHabitLog(habit.id, todayStr)}
                  className={`w-10 h-10 rounded-full flex items-center justify-center border transition-all ${
                    habit.is_completed_today
                      ? "bg-accent border-accent text-accent-light shadow-sm"
                      : "border-[rgba(28,25,23,0.2)] bg-background-elevated/50 hover:border-accent text-text-muted"
                  }`}
                  title={
                    habit.is_completed_today
                      ? "Completed today!"
                      : "Mark completed for today"
                  }
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color || "#C2410C" }}
                    />
                    <h3 className="text-sm font-semibold font-sora text-text-primary truncate">
                      {habit.name}
                    </h3>
                  </div>
                  {habit.description && (
                    <p className="text-xs text-text-secondary truncate mt-0.5">
                      {habit.description}
                    </p>
                  )}
                </div>
              </div>

              {/* Streaks & Details */}
              <div className="flex items-center gap-3 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-background-elevated border border-[rgba(28,25,23,0.08)]">
                  <Flame
                    className={`w-4 h-4 ${
                      habit.current_streak > 0
                        ? "text-accent fill-accent"
                        : "text-text-muted"
                    }`}
                  />
                  <div className="text-xs font-bold font-sora text-text-primary tabular-nums">
                    {habit.current_streak}{" "}
                    <span className="text-[10px] font-normal text-text-muted">
                      {habit.current_streak === 1 ? "day" : "days"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Habit Library Modal */}
      <Modal
        isOpen={isLibraryOpen}
        onClose={() => setIsLibraryOpen(false)}
        title="Explore Habit Library"
        description="Choose from curated positive habits or adapt them to your routine."
        maxWidth="xl"
      >
        <div className="space-y-4">
          {/* Search bar */}
          <div className="relative">
            <Search className="w-4 h-4 text-text-muted absolute top-1/2 -translate-y-1/2 left-3 rtl:left-auto rtl:right-3 pointer-events-none" />
            <input
              type="text"
              value={librarySearch}
              onChange={(e) => setLibrarySearch(e.target.value)}
              placeholder="Search habit ideas..."
              className="w-full h-9 pl-9 pr-3 rtl:pl-3 rtl:pr-9 rounded-xl bg-background-elevated text-xs text-text-primary placeholder:text-text-muted border border-[rgba(28,25,23,0.08)] focus:outline-none focus:border-accent"
            />
          </div>

          {/* Category filter pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 text-xs">
            {HABIT_LIBRARY_CATEGORIES.map((cat) => (
              <button
                key={cat}
                type="button"
                onClick={() => setLibraryCategory(cat)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-all font-medium ${
                  libraryCategory === cat
                    ? "bg-accent text-accent-light shadow-sm"
                    : "bg-background-elevated text-text-secondary hover:text-text-primary"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Library Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-96 overflow-y-auto pr-1">
            {filteredLibrary.map((item) => {
              const isAdded = addedLibraryIds.has(item.id);
              return (
                <div
                  key={item.id}
                  className="p-3 rounded-xl border border-[rgba(28,25,23,0.08)] bg-white hover:border-accent/40 flex flex-col justify-between transition-all"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <span
                        className="text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full"
                        style={{
                          backgroundColor: `${item.color}15`,
                          color: item.color,
                        }}
                      >
                        {item.category}
                      </span>
                      <span className="text-[10px] text-text-muted capitalize">
                        {item.frequency}
                      </span>
                    </div>

                    <h4 className="text-xs font-bold font-sora text-text-primary">
                      {item.name}
                    </h4>
                    <p className="text-[11px] text-text-secondary mt-0.5 line-clamp-2">
                      {item.description}
                    </p>
                  </div>

                  <div className="mt-3 pt-2 border-t border-[rgba(28,25,23,0.06)] flex justify-end">
                    <button
                      type="button"
                      disabled={isAdded}
                      onClick={() => handleAddFromLibrary(item)}
                      className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 transition-all ${
                        isAdded
                          ? "bg-status-success/15 text-status-success cursor-default"
                          : "bg-accent/10 text-accent hover:bg-accent hover:text-accent-light"
                      }`}
                    >
                      {isAdded ? (
                        <>
                          <Check className="w-3 h-3" />
                          <span>Added</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-3 h-3" />
                          <span>Add</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          <div className="flex justify-end pt-2 border-t border-[rgba(28,25,23,0.08)]">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsLibraryOpen(false)}
            >
              Done
            </Button>
          </div>
        </div>
      </Modal>

      {/* Create Custom Habit Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create Custom Habit"
        description="Track a positive recurring routine tailored to your lifestyle."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Habit Name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Walk & Sun"
          />

          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why do you want to keep this habit?"
            rows={2}
          />

          <Select
            label="Frequency"
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as HabitFrequency)}
            options={[
              { value: "daily", label: "Every Day" },
              { value: "weekdays", label: "Weekdays (Mon-Fri)" },
              { value: "weekly", label: "Once a Week" },
            ]}
          />

          <div>
            <label className="block text-xs font-medium text-text-secondary mb-2">
              Color Tag
            </label>
            <div className="flex items-center gap-2">
              {HABIT_COLORS.map((c) => (
                <button
                  key={c}
                  type="button"
                  onClick={() => setColor(c)}
                  style={{ backgroundColor: c }}
                  className={`w-7 h-7 rounded-full border-2 transition-transform ${
                    color === c
                      ? "scale-110 border-white shadow-md ring-2 ring-accent/40"
                      : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                  }`}
                />
              ))}
            </div>
          </div>

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
              Save Habit
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
