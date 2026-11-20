import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { Target, Plus, Check, Calendar, Trash2 } from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";

export const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const { goals, fetchGoals, createGoal, toggleMilestone, deleteGoal } =
    useGoalStore();

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
      {/* Header Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-accent-glow to-accent text-accent-light flex items-center justify-center shadow-sm">
            <Target className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold font-sora text-text-primary tracking-tight">
              {t("nav.goals") || "Goals"}
            </h1>
            <p className="text-xs text-text-secondary mt-0.5">
              Set milestones and track long-term personal aspirations.
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
          <div className="py-20 text-center rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card flex flex-col items-center">
            <div className="w-12 h-12 rounded-2xl bg-background-elevated flex items-center justify-center text-accent mb-3">
              <Target className="w-6 h-6" />
            </div>
            <h3 className="text-sm font-semibold font-sora text-text-primary mb-1">
              No long-term goals set yet
            </h3>
            <p className="text-xs text-text-secondary max-w-sm mb-4">
              Break down your annual or quarterly aspirations into clear, trackable milestones.
            </p>
            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsCreateOpen(true)}
            >
              Define First Goal
            </Button>
          </div>
        ) : (
          goals.map((goal) => (
            <div
              key={goal.id}
              className="p-5 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-[0_1px_2px_rgba(28,25,23,0.04)] space-y-4 hover:shadow-card hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h3 className="text-base font-bold font-sora text-text-primary tracking-tight">
                    {goal.title}
                  </h3>
                  {goal.description && (
                    <p className="text-xs text-text-secondary mt-1">
                      {goal.description}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3 shrink-0">
                  {goal.target_date && (
                    <span className="flex items-center gap-1.5 text-xs text-text-muted bg-background-elevated px-2.5 py-1 rounded-full font-mono">
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
                    className="p-1.5 rounded-lg text-text-muted hover:text-status-danger hover:bg-status-danger/10 transition-colors"
                    title="Delete goal"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
                  <span>
                    Milestones ({goal.completed_milestones_count} of{" "}
                    {goal.total_milestones_count} completed)
                  </span>
                  <span className="font-bold font-sora text-accent tabular-nums">
                    {goal.progress_percent}%
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-background-elevated overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-accent-glow to-accent transition-all duration-300 rounded-full"
                    style={{ width: `${goal.progress_percent}%` }}
                  />
                </div>
              </div>

              {/* Milestones Checklist */}
              {goal.milestones.length > 0 && (
                <div className="pt-2 border-t border-[rgba(28,25,23,0.06)] space-y-1.5">
                  {goal.milestones.map((m) => (
                    <button
                      key={m.id}
                      onClick={() => toggleMilestone(goal.id, m.id)}
                      className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-background-elevated/60 text-left transition-all group"
                    >
                      <div
                        className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                          m.completed
                            ? "bg-accent border-accent text-accent-light"
                            : "border-[rgba(28,25,23,0.25)] bg-white group-hover:border-accent"
                        }`}
                      >
                        {m.completed ? (
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        ) : null}
                      </div>
                      <span
                        className={`text-xs ${
                          m.completed
                            ? "line-through text-text-muted"
                            : "text-text-primary font-medium"
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
            placeholder="e.g., Complete Master's Thesis"
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
            placeholder="Draft proposal chapter&#10;Complete literature review&#10;Perform experiment benchmarks&#10;Final thesis defense"
            rows={4}
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
              Save Goal
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
