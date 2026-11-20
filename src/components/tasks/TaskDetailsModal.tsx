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
} from "lucide-react";
import { Reorder } from "motion/react";
import type { Priority, TaskStatus } from "@shared/types/database";

export const TaskDetailsModal: React.FC = () => {
  const {
    tasks,
    selectedTaskId,
    setSelectedTaskId,
    updateTask,
    deleteTask,
    addSubtask,
    toggleSubtask,
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
  const [planDate, setPlanDate] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

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
      setDueDate(task.due_at ? task.due_at.substring(0, 10) : "");
      setPlanDate(task.start_at ? task.start_at.substring(0, 10) : "");
      setRecurrence(task.recurrence_rule || "");
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    updateTask(task.id, {
      title: title.trim() || task.title,
      description: description.trim() || null,
      status,
      priority,
      category_id: categoryId || null,
      due_at: dueDate ? new Date(dueDate).toISOString() : null,
      start_at: planDate ? new Date(planDate).toISOString() : null,
      recurrence_rule: recurrence || null,
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
        </div>

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
                  <span
                    className={`truncate ${
                      st.completed === 1
                        ? "line-through text-text-muted"
                        : "text-text-primary font-medium"
                    }`}
                  >
                    {st.title}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => deleteSubtask(task.id, st.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-text-muted hover:text-status-danger transition-opacity rounded"
                  title="Delete sub-task"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
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
