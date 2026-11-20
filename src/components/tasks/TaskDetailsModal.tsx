import React, { useState, useEffect } from "react";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTaskStore } from "@/store/useTaskStore";
import { Trash2, Plus, Calendar, CheckSquare } from "lucide-react";
import type { Priority, TaskStatus } from "@shared/types/database";

export const TaskDetailsModal: React.FC = () => {
  const { tasks, selectedTaskId, setSelectedTaskId, updateTask, deleteTask } =
    useTaskStore();

  const task = tasks.find((t) => t.id === selectedTaskId);

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [status, setStatus] = useState<TaskStatus>("todo");
  const [priority, setPriority] = useState<Priority>("medium");
  const [dueDate, setDueDate] = useState("");
  const [recurrence, setRecurrence] = useState("");
  const [newSubtaskTitle, setNewSubtaskTitle] = useState("");

  useEffect(() => {
    if (task) {
      setTitle(task.title);
      setDescription(task.description || "");
      setStatus(task.status);
      setPriority(task.priority);
      setDueDate(task.due_at ? task.due_at.substring(0, 10) : "");
      setRecurrence(task.recurrence_rule || "");
    }
  }, [task]);

  if (!task) return null;

  const handleSave = () => {
    updateTask(task.id, {
      title,
      description: description.trim() || null,
      status,
      priority,
      due_at: dueDate ? new Date(dueDate).toISOString() : null,
      recurrence_rule: recurrence || null,
    });
    setSelectedTaskId(null);
  };

  const handleDelete = () => {
    deleteTask(task.id);
    setSelectedTaskId(null);
  };

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

        <div className="grid grid-cols-2 gap-3">
          <Select
            label="Status"
            value={status}
            onChange={(e) => setStatus(e.target.value as TaskStatus)}
            options={[
              { value: "inbox", label: "Inbox" },
              { value: "todo", label: "To Do" },
              { value: "in_progress", label: "In Progress" },
              { value: "done", label: "Done" },
              { value: "cancelled", label: "Cancelled" },
            ]}
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
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        <div className="space-y-2 pt-2 border-t border-border-subtle/60">
          <label className="block text-xs font-medium text-text-secondary">
            Subtasks ({task.subtasks.filter((s) => s.completed === 1).length}/
            {task.subtasks.length})
          </label>

          <div className="space-y-1.5 max-h-40 overflow-y-auto">
            {task.subtasks.map((st) => (
              <div
                key={st.id}
                className="flex items-center gap-2 p-2 rounded-lg bg-background-elevated/40 text-xs"
              >
                <CheckSquare
                  className={`w-4 h-4 ${
                    st.completed ? "text-accent" : "text-text-muted"
                  }`}
                />
                <span
                  className={st.completed ? "line-through text-text-muted" : "text-text-primary"}
                >
                  {st.title}
                </span>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2">
            <Input
              value={newSubtaskTitle}
              onChange={(e) => setNewSubtaskTitle(e.target.value)}
              placeholder="Add a new subtask..."
              className="text-xs h-8"
            />
            <Button
              type="button"
              variant="outline"
              size="xs"
              onClick={() => {
                if (newSubtaskTitle.trim()) {
                  // Add subtask
                  setNewSubtaskTitle("");
                }
              }}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>

        {/* Bottom Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-border-subtle/50">
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={handleDelete}
            className="text-red-400 hover:text-red-300 hover:bg-red-500/10"
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
