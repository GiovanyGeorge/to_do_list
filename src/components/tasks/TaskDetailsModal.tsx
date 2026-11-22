import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTaskStore } from "@/store/useTaskStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import {
  Trash2,
  Plus,
  Calendar,
  Sun,
  X,
  GripVertical,
  Check,
  Clock,
  Bell,
} from "lucide-react";
import { Reorder } from "motion/react";
import type { Priority, TaskStatus } from "@shared/types/database";
import {
  extractLocalDate,
  extractLocalTime,
  createDateTimeISO,
} from "@/lib/dateUtils";

export const TaskDetailsModal: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
    updateSubtask,
    deleteSubtask,
    reorderSubtasks,
  } = useTaskStore();

  const { categories, fetchCategories } = useCategoryStore();

  const task = tasks.find((t) => t.id === selectedTaskId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [categoryId, setCategoryId] = useState<string>("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("19:00");
  const [reminderPreset, setReminderPreset] = useState<"none" | "at_due" | "5m" | "15m" | "30m" | "1h" | "1d" | "custom">("none");
  const [customReminder, setCustomReminder] = useState("");
  const [planDate, setPlanDate] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");
  const [editingSubtaskId, setEditingSubtaskId] = useState<string | null>(null);
  const [editingSubtaskTitle, setEditingSubtaskTitle] = useState("");

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setCategoryId(task.category_id || "");
      setPlanDate(extractLocalDate(task.start_at));
      setRecurrence(task.recurrence_rule || "");

      if (task.due_at) {
        setDueDate(extractLocalDate(task.due_at));
        setDueTime(extractLocalTime(task.due_at));
      } else {
        setDueDate("");
        setDueTime("19:00");
      }

      if (task.reminder_at) {
        setReminderPreset("custom");
        const rDate = new Date(task.reminder_at);
        if (!isNaN(rDate.getTime())) {
          const rDateStr = extractLocalDate(task.reminder_at);
          const rTimeStr = extractLocalTime(task.reminder_at);
          setCustomReminder(`${rDateStr}T${rTimeStr}`);
        } else {
          setCustomReminder("");
        }
      } else {
        setReminderPreset("none");
        setCustomReminder("");
      }
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    // Calculate due_at in user's local timezone
    let dueAtISO: string | null = null;
    if (dueDate) {
      const [hh, mm] = dueTime.includes(":") ? dueTime.split(":") : ["19", "00"];
      dueAtISO = createDateTimeISO(dueDate, `${hh}:${mm}`);
    }

    // Calculate reminder_at in user's local timezone
    let reminderAtISO: string | null = null;
    if (reminderPreset === "at_due" && dueAtISO) {
      reminderAtISO = dueAtISO;
    } else if (reminderPreset === "5m" && dueAtISO) {
      reminderAtISO = new Date(new Date(dueAtISO).getTime() - 5 * 60 * 1000).toISOString();
    } else if (reminderPreset === "15m" && dueAtISO) {
      reminderAtISO = new Date(new Date(dueAtISO).getTime() - 15 * 60 * 1000).toISOString();
    } else if (reminderPreset === "30m" && dueAtISO) {
      reminderAtISO = new Date(new Date(dueAtISO).getTime() - 30 * 60 * 1000).toISOString();
    } else if (reminderPreset === "1h" && dueAtISO) {
      reminderAtISO = new Date(new Date(dueAtISO).getTime() - 60 * 60 * 1000).toISOString();
    } else if (reminderPreset === "1d" && dueAtISO) {
      reminderAtISO = new Date(new Date(dueAtISO).getTime() - 24 * 60 * 60 * 1000).toISOString();
    } else if (reminderPreset === "custom" && customReminder) {
      const [cDate, cTime] = customReminder.split("T");
      if (cDate && cTime) {
        reminderAtISO = createDateTimeISO(cDate, cTime);
      }
    }

    updateTask(task.id, {
      title: title.trim() || task.title,
      description: description.trim() || null,
      status,
      priority,
      category_id: categoryId || null,
      due_at: dueAtISO,
      start_at: planDate ? planDate : null,
      recurrence_rule: recurrence || null,
      reminder_at: reminderAtISO,
    });
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setSelectedTaskId(null);
  };

  const handleAddSubtask = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtaskTitle.trim()) return;
    await addSubtask(task.id, newSubtaskTitle.trim());
    setNewSubtaskTitle("");
  };

  const handleSubtaskReorder = (newOrderedSubtasks: typeof task.subtasks) => {
    reorderSubtasks(
      task.id,
      newOrderedSubtasks.map((s) => s.id)
    );
  };

  const completedSubsCount =
    task.subtasks.filter((s) => s.completed === 1).length;
  const totalSubsCount = task.subtasks.length;
  const subtaskProgress =
    totalSubsCount > 0 ? (completedSubsCount / totalSubsCount) * 100 : 0;

  const categoryOptions = [
    { value: "", label: "No Category" },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  return (
    <Modal
      isOpen={!!selectedTaskId}
      onClose={() => setSelectedTaskId(null)}
      title="Task Details"
      description={`Created on ${new Intl.DateTimeFormat(undefined, {
        dateStyle: "medium",
        timeStyle: "short",
      }).format(new Date(task.created_at))}`}
      maxWidth="lg"
    >
      <div className="space-y-4">
        <Input
          label="Title"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Task title"
        />

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Select
            label="Category"
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            options={categoryOptions}
          />

          <Select
            label="Priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as Priority)}
            options={[
              { value: "low", label: "Low Priority" },
              { value: "medium", label: "Medium Priority" },
              { value: "high", label: "High Priority" },
              { value: "urgent", label: "Urgent Priority" },
            ]}
          />

          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: "todo", label: "To Do" },
              { value: "in_progress", label: "In Progress" },
              { value: "done", label: "Done" },
            ]}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <Input
            label="Planned Day"
            type="date"
            value={planDate}
            onChange={(e) => setPlanDate(e.target.value)}
            leftIcon={<Sun className="w-4 h-4 text-accent" />}
          />

          <Input
            label="Due Date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />

          <Input
            label="Due Time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4 text-text-muted" />}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Select
            label="Recurrence"
            value={recurrence}
            onChange={(e) => setRecurrence(e.target.value)}
            options={[
              { value: "", label: "No Repeat" },
              { value: "daily", label: "Daily" },
              { value: "weekly", label: "Weekly" },
              { value: "monthly", label: "Monthly" },
              { value: "yearly", label: "Yearly" },
            ]}
          />

          <Select
            label="Remind at"
            value={reminderPreset}
            onChange={(e) => setReminderPreset(e.target.value as any)}
            options={[
              { value: "none", label: "No reminder" },
              { value: "at_due", label: "At due time" },
              { value: "5m", label: "5 minutes before" },
              { value: "15m", label: "15 minutes before" },
              { value: "30m", label: "30 minutes before" },
              { value: "1h", label: "1 hour before" },
              { value: "1d", label: "1 day before" },
              { value: "custom", label: "Custom date & time..." },
            ]}
          />
        </div>

        {reminderPreset === "custom" && (
          <Input
            label="Custom Reminder Date & Time"
            type="datetime-local"
            value={customReminder}
            onChange={(e) => setCustomReminder(e.target.value)}
            leftIcon={<Bell className="w-4 h-4 text-accent" />}
          />
        )}

        <Textarea
          label="Description / Notes"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add detailed task notes..."
          rows={3}
        />

        {/* Subtasks Section */}
        <div className="space-y-2.5 pt-3 border-t border-[rgba(28,25,23,0.08)]">
          <div className="flex items-center justify-between text-xs">
            <span className="font-semibold text-text-primary">
              Sub-tasks ({completedSubsCount} of {totalSubsCount} completed)
            </span>
            {totalSubsCount > 0 && (
              <span className="text-text-secondary font-mono">
                {Math.round(subtaskProgress)}%
              </span>
            )}
          </div>

          {/* Progress bar */}
          {totalSubsCount > 0 && (
            <div className="h-1.5 w-full bg-background-elevated rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-accent-glow to-accent transition-all duration-300 rounded-full"
                style={{ width: `${subtaskProgress}%` }}
              />
            </div>
          )}

          {/* Subtask list with drag and drop reordering */}
          <Reorder.Group
            axis="y"
            values={task.subtasks}
            onReorder={handleSubtaskReorder}
            className="space-y-1.5 max-h-48 overflow-y-auto pr-1"
          >
            {task.subtasks.map((st) => (
              <Reorder.Item
                key={st.id}
                value={st}
                className="flex items-center justify-between gap-2 p-2 rounded-lg bg-background-elevated/40 hover:bg-background-elevated/80 border border-[rgba(28,25,23,0.06)] group transition-all text-xs"
              >
                <div className="flex items-center gap-2 min-w-0 flex-1">
                  <GripVertical className="w-3.5 h-3.5 text-text-muted opacity-0 group-hover:opacity-60 cursor-grab shrink-0" />
                  <button
                    type="button"
                    onClick={() => toggleSubtask(task.id, st.id)}
                    className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors shrink-0 ${
                      st.completed === 1
                        ? "bg-accent border-accent text-accent-light"
                        : "border-[rgba(28,25,23,0.3)] bg-white hover:border-accent"
                    }`}
                  >
                    {st.completed === 1 && (
                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                    )}
                  </button>

                  {editingSubtaskId === st.id ? (
                    <input
                      type="text"
                      autoFocus
                      value={editingSubtaskTitle}
                      onChange={(e) => setEditingSubtaskTitle(e.target.value)}
                      onBlur={async () => {
                        if (editingSubtaskTitle.trim() && editingSubtaskTitle !== st.title) {
                          await updateSubtask(task.id, st.id, editingSubtaskTitle.trim());
                        }
                        setEditingSubtaskId(null);
                      }}
                      onKeyDown={async (e) => {
                        if (e.key === "Enter") {
                          e.preventDefault();
                          if (editingSubtaskTitle.trim() && editingSubtaskTitle !== st.title) {
                            await updateSubtask(task.id, st.id, editingSubtaskTitle.trim());
                          }
                          setEditingSubtaskId(null);
                        } else if (e.key === "Escape") {
                          setEditingSubtaskId(null);
                        }
                      }}
                      className="flex-1 bg-white px-2 py-0.5 rounded border border-accent text-xs text-text-primary focus:outline-none"
                    />
                  ) : (
                    <span
                      onDoubleClick={() => {
                        setEditingSubtaskId(st.id);
                        setEditingSubtaskTitle(st.title);
                      }}
                      className={`truncate cursor-text ${
                        st.completed === 1
                          ? "line-through text-text-muted"
                          : "text-text-primary font-medium"
                      }`}
                      title="Double click to edit title"
                    >
                      {st.title}
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => {
                      setEditingSubtaskId(st.id);
                      setEditingSubtaskTitle(st.title);
                    }}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-accent transition-opacity rounded"
                    title="Edit title"
                  >
                    <span className="text-[10px] font-mono">✎</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => deleteSubtask(task.id, st.id)}
                    className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-status-danger transition-opacity rounded"
                    title="Delete sub-task"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </Reorder.Item>
            ))}
          </Reorder.Group>

          {/* Add Subtask Input */}
          <form onSubmit={handleAddSubtask} className="flex items-center gap-2 pt-1">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a new sub-task..."
              className="text-xs h-8"
            />
            <Button
              type="submit"
              variant="secondary"
              size="xs"
              disabled={!newSubtaskTitle.trim()}
              className="h-8 px-3 shrink-0"
            >
              <Plus className="w-3.5 h-3.5" />
              Add
            </Button>
          </form>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-[rgba(28,25,23,0.08)]">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-status-danger hover:bg-status-danger/10"
            leftIcon={<Trash2 className="w-4 h-4" />}
          >
            Delete
          </Button>

          <div className="flex items-center gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setSelectedTaskId(null)}
            >
              Cancel
            </Button>
            <Button type="button" variant="primary" size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
};
