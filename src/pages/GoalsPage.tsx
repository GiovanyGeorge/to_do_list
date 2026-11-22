import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  Target,
  Plus,
  Check,
  Calendar,
  Trash2,
  ChevronUp,
  ChevronDown,
  Edit2,
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
} from "lucide-react";
import { useGoalStore } from "@/store/useGoalStore";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";
import { Input, Textarea } from "@/components/ui/Input";
import { getTodayLocalDateString, extractLocalDate } from "@/lib/dateUtils";
import type { GoalMilestoneRecord } from "@shared/types/database";

export const GoalsPage: React.FC = () => {
  const { t } = useTranslation();
  const {
    goals,
    fetchGoals,
    createGoal,
    toggleMilestone,
    addMilestone,
    updateMilestone,
    deleteMilestone,
    reorderMilestones,
    deleteGoal,
  } = useGoalStore();

  const { projects, fetchProjects } = useProjectStore();
  const { tasks, fetchTasks } = useTaskStore();

  // Create Goal Modal State
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [targetDate, setTargetDate] = useState("");
  const [milestonesText, setMilestonesText] = useState("");

  // Inline Milestone State per Goal
  const [activeAddGoalId, setActiveAddGoalId] = useState<string | null>(null);
  const [newMilestoneTitle, setNewMilestoneTitle] = useState("");
  const [newMilestoneDate, setNewMilestoneDate] = useState("");
  const [newMilestoneProjectId, setNewMilestoneProjectId] = useState("");
  const [newMilestoneTaskId, setNewMilestoneTaskId] = useState("");

  // Inline Milestone Editing State
  const [editingMilestoneId, setEditingMilestoneId] = useState<string | null>(null);
  const [editingMilestoneTitle, setEditingMilestoneTitle] = useState("");

  const todayStr = getTodayLocalDateString();

  useEffect(() => {
    fetchGoals();
    fetchProjects();
    fetchTasks();
  }, [fetchGoals, fetchProjects, fetchTasks]);

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

  const handleAddMilestoneSubmit = async (goalId: string, e: React.FormEvent) => {
    e.preventDefault();
    if (!newMilestoneTitle.trim()) return;

    await addMilestone(goalId, {
      title: newMilestoneTitle.trim(),
      targetDate: newMilestoneDate || undefined,
      projectId: newMilestoneProjectId || undefined,
      taskId: newMilestoneTaskId || undefined,
    });

    setNewMilestoneTitle("");
    setNewMilestoneDate("");
    setNewMilestoneProjectId("");
    setNewMilestoneTaskId("");
    setActiveAddGoalId(null);
  };

  const handleSaveMilestoneTitle = async (goalId: string, milestoneId: string) => {
    if (editingMilestoneTitle.trim()) {
      await updateMilestone(goalId, milestoneId, {
        title: editingMilestoneTitle.trim(),
      });
    }
    setEditingMilestoneId(null);
  };

  const handleMoveMilestone = async (
    goalId: string,
    milestones: GoalMilestoneRecord[],
    index: number,
    direction: "up" | "down"
  ) => {
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= milestones.length) return;

    const reordered = [...milestones];
    const temp = reordered[index];
    reordered[index] = reordered[targetIndex];
    reordered[targetIndex] = temp;

    await reorderMilestones(
      goalId,
      reordered.map((m) => m.id)
    );
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto pb-10">
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
              Set milestones, connect projects, and track long-term aspirations.
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
      <div className="space-y-5">
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
          goals.map((goal) => {
            const nextMilestone = goal.milestones.find((m) => !m.completed);

            return (
              <div
                key={goal.id}
                className="p-6 rounded-2xl bg-white border border-[rgba(28,25,23,0.08)] shadow-card space-y-5 transition-all duration-200"
              >
                {/* Header Row */}
                <div className="flex items-start justify-between gap-4">
                  <div className="space-y-1">
                    <h3 className="text-base font-bold font-sora text-text-primary tracking-tight">
                      {goal.title}
                    </h3>
                    {goal.description && (
                      <p className="text-xs text-text-secondary leading-relaxed">
                        {goal.description}
                      </p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {goal.target_date && (
                      <span className="flex items-center gap-1.5 text-xs text-text-muted bg-background-elevated px-3 py-1 rounded-full font-mono">
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

                {/* Progress Bar & Stats */}
                <div className="space-y-1.5 bg-background-elevated/40 p-3.5 rounded-xl border border-[rgba(28,25,23,0.05)]">
                  <div className="flex items-center justify-between text-xs text-text-secondary font-medium">
                    <span>
                      Milestones ({goal.completed_milestones_count} of{" "}
                      {goal.total_milestones_count} completed)
                    </span>
                    <span className="font-bold font-sora text-accent tabular-nums text-sm">
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

                {/* Highlight Next Milestone Card if exists */}
                {nextMilestone && (
                  <div className="p-3.5 rounded-xl bg-accent/5 border border-accent/20 flex items-center justify-between gap-3 text-xs">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-6 h-6 rounded-lg bg-accent text-accent-light flex items-center justify-center shrink-0 shadow-sm">
                        <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
                      </div>
                      <div className="min-w-0">
                        <span className="text-[10px] uppercase font-bold text-accent tracking-wider block">
                          Next Milestone
                        </span>
                        <span className="font-semibold text-text-primary truncate block">
                          {nextMilestone.title}
                        </span>
                      </div>
                    </div>
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={() => toggleMilestone(goal.id, nextMilestone.id)}
                      className="h-7 text-xs px-3"
                    >
                      Complete
                    </Button>
                  </div>
                )}

                {/* Milestones Header & Add Button */}
                <div className="pt-2 border-t border-[rgba(28,25,23,0.06)]">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold font-sora text-text-primary">
                      Milestones List ({goal.milestones.length})
                    </span>
                    <button
                      onClick={() =>
                        setActiveAddGoalId(
                          activeAddGoalId === goal.id ? null : goal.id
                        )
                      }
                      className="text-xs font-semibold text-accent hover:underline flex items-center gap-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add Milestone</span>
                    </button>
                  </div>

                  {/* Inline Add Milestone Form */}
                  {activeAddGoalId === goal.id && (
                    <form
                      onSubmit={(e) => handleAddMilestoneSubmit(goal.id, e)}
                      className="p-4 rounded-xl bg-background-elevated/70 border border-[rgba(28,25,23,0.1)] mb-3 space-y-3"
                    >
                      <Input
                        autoFocus
                        placeholder="Milestone title..."
                        value={newMilestoneTitle}
                        onChange={(e) => setNewMilestoneTitle(e.target.value)}
                        className="text-xs h-8"
                      />

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
                        {/* Target Date */}
                        <div>
                          <label className="text-[11px] text-text-secondary block mb-1">
                            Target Date
                          </label>
                          <input
                            type="date"
                            value={newMilestoneDate}
                            onChange={(e) => setNewMilestoneDate(e.target.value)}
                            className="w-full px-2.5 py-1.5 rounded-lg bg-white border border-[rgba(28,25,23,0.12)] text-xs text-text-primary focus:outline-none focus:border-accent"
                          />
                        </div>

                        {/* Link to Project */}
                        <div>
                          <label className="text-[11px] text-text-secondary block mb-1">
                            Link Project
                          </label>
                          <select
                            value={newMilestoneProjectId}
                            onChange={(e) =>
                              setNewMilestoneProjectId(e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-[rgba(28,25,23,0.12)] text-xs text-text-primary focus:outline-none focus:border-accent"
                          >
                            <option value="">None</option>
                            {projects.map((p) => (
                              <option key={p.id} value={p.id}>
                                {p.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        {/* Link to Task */}
                        <div>
                          <label className="text-[11px] text-text-secondary block mb-1">
                            Link Task
                          </label>
                          <select
                            value={newMilestoneTaskId}
                            onChange={(e) =>
                              setNewMilestoneTaskId(e.target.value)
                            }
                            className="w-full px-2 py-1.5 rounded-lg bg-white border border-[rgba(28,25,23,0.12)] text-xs text-text-primary focus:outline-none focus:border-accent"
                          >
                            <option value="">None</option>
                            {tasks.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.title}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => setActiveAddGoalId(null)}
                        >
                          Cancel
                        </Button>
                        <Button
                          type="submit"
                          variant="primary"
                          size="sm"
                          disabled={!newMilestoneTitle.trim()}
                        >
                          Save Milestone
                        </Button>
                      </div>
                    </form>
                  )}

                  {/* Milestones List */}
                  <div className="space-y-1.5">
                    {goal.milestones.map((m, idx) => {
                      const isOverdue =
                        m.target_date &&
                        !m.completed &&
                        extractLocalDate(m.target_date) < todayStr;

                      const linkedProject = m.project_id
                        ? projects.find((p) => p.id === m.project_id)
                        : null;
                      const linkedTask = m.task_id
                        ? tasks.find((t) => t.id === m.task_id)
                        : null;

                      return (
                        <div
                          key={m.id}
                          className="flex items-center justify-between gap-3 p-2.5 rounded-xl bg-background-elevated/40 hover:bg-background-elevated/70 border border-[rgba(28,25,23,0.06)] group transition-all"
                        >
                          {/* Checkbox and Title */}
                          <div className="flex items-center gap-2.5 min-w-0 flex-1">
                            <button
                              type="button"
                              onClick={() => toggleMilestone(goal.id, m.id)}
                              className={`w-4 h-4 rounded-full flex items-center justify-center border transition-all shrink-0 ${
                                m.completed
                                  ? "bg-accent border-accent text-accent-light"
                                  : "border-[rgba(28,25,23,0.25)] bg-white hover:border-accent"
                              }`}
                            >
                              {m.completed ? (
                                <Check className="w-2.5 h-2.5 stroke-[3]" />
                              ) : null}
                            </button>

                            {editingMilestoneId === m.id ? (
                              <input
                                type="text"
                                autoFocus
                                value={editingMilestoneTitle}
                                onChange={(e) =>
                                  setEditingMilestoneTitle(e.target.value)
                                }
                                onBlur={() =>
                                  handleSaveMilestoneTitle(goal.id, m.id)
                                }
                                onKeyDown={(e) => {
                                  if (e.key === "Enter") {
                                    handleSaveMilestoneTitle(goal.id, m.id);
                                  } else if (e.key === "Escape") {
                                    setEditingMilestoneId(null);
                                  }
                                }}
                                className="flex-1 bg-white px-2 py-0.5 rounded border border-accent text-xs text-text-primary focus:outline-none"
                              />
                            ) : (
                              <span
                                onDoubleClick={() => {
                                  setEditingMilestoneId(m.id);
                                  setEditingMilestoneTitle(m.title);
                                }}
                                className={`text-xs truncate cursor-text ${
                                  m.completed
                                    ? "line-through text-text-muted"
                                    : "text-text-primary font-medium"
                                }`}
                                title="Double-click to edit milestone"
                              >
                                {m.title}
                              </span>
                            )}
                          </div>

                          {/* Metadata Badges & Action Buttons */}
                          <div className="flex items-center gap-2 shrink-0">
                            {/* Linked project pill */}
                            {linkedProject && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-medium"
                                style={{
                                  backgroundColor: `${linkedProject.color || "#C2410C"}15`,
                                  color: linkedProject.color || "#C2410C",
                                }}
                                title={`Linked Project: ${linkedProject.name}`}
                              >
                                <FolderKanban className="w-3 h-3" />
                                <span className="max-w-[80px] truncate">
                                  {linkedProject.name}
                                </span>
                              </span>
                            )}

                            {/* Linked task pill */}
                            {linkedTask && (
                              <span
                                className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-accent/10 text-accent font-medium"
                                title={`Linked Task: ${linkedTask.title}`}
                              >
                                <CheckCircle2 className="w-3 h-3" />
                                <span className="max-w-[80px] truncate">
                                  {linkedTask.title}
                                </span>
                              </span>
                            )}

                            {/* Target Date Badge */}
                            {m.target_date && (
                              <span
                                className={`inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full font-mono ${
                                  isOverdue
                                    ? "bg-status-danger/10 text-status-danger font-semibold"
                                    : "bg-white text-text-muted border border-[rgba(28,25,23,0.08)]"
                                }`}
                              >
                                {isOverdue && (
                                  <AlertTriangle className="w-2.5 h-2.5 text-status-danger" />
                                )}
                                <Calendar className="w-2.5 h-2.5" />
                                {new Intl.DateTimeFormat(undefined, {
                                  month: "short",
                                  day: "numeric",
                                }).format(new Date(m.target_date))}
                              </span>
                            )}

                            {/* Reorder Buttons */}
                            <div className="opacity-0 group-hover:opacity-100 flex items-center transition-opacity">
                              <button
                                type="button"
                                disabled={idx === 0}
                                onClick={() =>
                                  handleMoveMilestone(
                                    goal.id,
                                    goal.milestones,
                                    idx,
                                    "up"
                                  )
                                }
                                className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                                title="Move up"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                disabled={idx === goal.milestones.length - 1}
                                onClick={() =>
                                  handleMoveMilestone(
                                    goal.id,
                                    goal.milestones,
                                    idx,
                                    "down"
                                  )
                                }
                                className="p-1 text-text-muted hover:text-text-primary disabled:opacity-30"
                                title="Move down"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  setEditingMilestoneId(m.id);
                                  setEditingMilestoneTitle(m.title);
                                }}
                                className="p-1 text-text-muted hover:text-accent"
                                title="Edit title"
                              >
                                <Edit2 className="w-3 h-3" />
                              </button>
                              <button
                                type="button"
                                onClick={() => deleteMilestone(goal.id, m.id)}
                                className="p-1 text-text-muted hover:text-status-danger"
                                title="Delete milestone"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })
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
