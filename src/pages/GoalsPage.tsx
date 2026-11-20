import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Target, Plus, CheckSquare, Calendar, Trash2 } from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";

export const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { goals, fetchGoals, createGoal, toggleMilestone, deleteGoal } = useGoalStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesText, setMilestonesText] = useState("");

  useEffect(() => {
    fetchGoals();
  }, [fetchGoals]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const milestones = milestonesText
      .split("\n")
      .map((s) => s.trim())
      .filter(Boolean);

    await createGoal({
      title: title.trim(),
      description: description.trim() || undefined,
      targetDate: targetDate ? new Date(targetDate).toISOString() : undefined,
      milestones,
    });

    setTitle("");
    setDescription("");
    setTargetDate("");
    setMilestonesText("");
    setIsCreateOpen(false);
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {t("nav.goals")}
            </h1>
            <p className="text-xs text-text-secondary">
              Set milestones and track long-term personal objectives
            </p>
          </div>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={() => setIsCreateOpen(true)}
          leftIcon={<Plus className="w-4 h-4" />}
        >
          New Goal
        </Button>
      </div>

      {/* Goal Cards */}
      <div className="space-y-4">
        {goals.length === 0 ? (
          <div className="py-16 text-center rounded-2xl bg-background-card/50 border border-border-subtle flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
              <Target className="w-6 h-6 text-accent" />
            </div>
            <h3 className="text-sm font-semibold text-text-primary mb-1">
              No long-term goals set yet
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-4">
              Break down your annual or quarterly aspirations into clear, trackable milestones.
            </p>
            <Button variant="primary" size="sm" onClick={() => setIsCreateOpen(true)}>
              Define First Goal
            </Button>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-background-card border border-border-subtle space-y-4 hover:border-accent/30 transition-colors"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-semibold text-text-primary tracking-tight">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-text-secondary mt-1">{goal.description}</p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {goal.target_date && (
                    <span className="flex items-center gap-1 text-xs text-text-muted bg-background-elevated px-2.5 py-1 rounded-lg">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Intl.DateTimeFormat(undefined, {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      }).format(new Date(goal.target_date))}
                    </span>
                  )}
                  <button
                    onClick={() => deleteGoal(goal.id)}
                    className="p-1.5 rounded-lg text-text-muted hover:text-red-400 hover:bg-background-elevated transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-text-secondary">
                  <span>
                    Milestones ({goal.completed_milestones_count}/{goal.total_milestones_count})
                  </span>
                  <span className="font-bold text-accent">{goal.progress_percent}%</span>
                </div>
                <div className="w-full h-2 rounded-full bg-background-elevated overflow-hidden">
                  <div
                    className="h-full bg-accent transition-all duration-300"
                    style={{ width: `${goal.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklist */}
              {goal.milestones.length > 0 && (
                <div className="pt-2 border-t border-border-subtle/50 space-y-1.5">
                  {goal.milestones.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMilestone(goal.id, m.id)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-lg hover:bg-background-elevated/60 text-left transition-colors"
                    >
                      <CheckSquare
                        className={`w-4 h-4 shrink-0 ${
                          m.completed ? "text-accent" : "text-text-muted"
                        }`}
                      />
                      <span
                        className={`text-xs ${
                          m.completed ? "line-through text-text-muted" : "text-text-primary"
                        }`}
                      >
                        {m.title}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* Create Goal Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Set New Goal"
        description="Define a major objective and breakdown key milestones."
        maxWidth="md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Goal Title"
            autoFocus
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g., Read 20 books this year"
          />

          <Textarea
            label="Description (optional)"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Why is this goal important to you?"
            rows={2}
          />

          <Input
            label="Target Completion Date (optional)"
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
          />

          <Textarea
            label="Milestones (one per line)"
            value={milestonesText}
            onChange={(e) => setMilestonesText(e.target.value)}
            placeholder="Read 5 books in Q1&#10;Read 5 books in Q2&#10;Read 5 books in Q3&#10;Read 5 books in Q4"
            rows={4}
          />

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle/50">
            <Button type="button" variant="outline" size="sm" onClick={() => setIsCreateOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="sm">
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
