import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Sparkles, Plus, Flame, Check, Trash2 } from "lucide-react";
import { useHabitStore } from "@/store/useHabitStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { Select } from "@/components/ui/Select";
import type { HabitFrequency } from "@shared/types/database";

const HABIT_COLORS = ["#E99A43", "#10B981", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"];

export const HabitsPage: React.FC = () => {
  const { t } = useTranslation();
  const { habits, fetchHabits, createHabit, toggleHabitLog, deleteHabit } = useHabitStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [frequency, setFrequency] = useState<HabitFrequency>("daily");
  const [color, setColor] = useState(HABIT_COLORS[0]);

  const todayStr = new Date().toISOString().substring(0, 10);

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

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-500/15 text-purple-400 flex items-center justify-center">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {t("nav.habits")}
            </h1>
            <p className="text-xs text-text-secondary">
              Build lasting daily routines and track your streaks
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Habit
        </Button>
      </div>

      {/* Habit List */}
      <div className="space-y-3">
        {habits.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-background-card/50 border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <Sparkles className="w-6 h-6 text-purple-400" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              No habits tracked yet
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-4">
              Create a habit like reading, exercising, or meditating to build daily consistency.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Start First Habit
            </Button>
          </div>
        ) : (
          habits.map((habit) => (
            <div
              key={habit.id}
              className="p-4 rounded-2xl bg-background-card border border-border-subtle flex items-center justify-between gap-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-center gap-4 min-w-0">
                <button
                  onClick={() => toggleHabitLog(habit.id, todayStr)}
                  className={`w-10 h-10 rounded-xl flex items-center justify-center border transition-all ${
                    habit.is_completed_today
                      ? "bg-accent border-accent text-background shadow-sm"
                      : "border-border-subtle bg-background-elevated hover:border-accent/50 text-text-muted"
                  }`}
                  title={habit.is_completed_today ? "Completed today!" : "Mark completed for today"}
                >
                  <Check className="w-5 h-5 stroke-[2.5]" />
                </button>

                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-2.5 h-2.5 rounded-full shrink-0"
                      style={{ backgroundColor: habit.color || "#E99A43" }}
                    />
                    <h3 className="text-sm font-semibold text-text-primary truncate">
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
              <div className="flex items-center gap-4 shrink-0">
                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-background-elevated/70 border border-border-subtle">
                  <Flame
                    className={`w-4 h-4 ${
                      habit.current_streak > 0 ? "text-amber-500 fill-amber-500" : "text-text-muted"
                    }`}
                  />
                  <div className="text-xs font-bold text-text-primary">
                    {habit.current_streak}{" "}
                    <span className="text-[10px] font-normal text-text-muted">days</span>
                  </div>
                </div>

                <button
                  onClick={() => deleteHabit(habit.id)}
                  className="p-2 rounded-lg text-text-muted hover:text-red-400 hover:bg-background-elevated transition-colors"
                  title="Delete habit"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Create Habit Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Habit"
        description="Track a positive recurring routine."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Habit Name"
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g., Morning Meditation"
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

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle/50">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
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
