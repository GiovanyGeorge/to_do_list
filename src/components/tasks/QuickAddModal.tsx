import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTaskStore } from "@/store/useTaskStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import type { Priority } from "@shared/types/database";
import { Calendar, Sun, Clock } from "lucide-react";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { t } = useTranslation();
  const { createTask } = useTaskStore();
  const { categories, fetchCategories } = useCategoryStore();

  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [categoryId, setCategoryId] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("19:00");
  const [reminder, setReminder] = useState<"none" | "at_due" | "5m" | "15m" | "30m" | "1h">("15m");
  const [planDate, setPlanDate] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      fetchCategories();
    }
  }, [isOpen, fetchCategories]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    let dueAtISO: string | undefined = undefined;
    let reminderAtISO: string | undefined = undefined;

    if (dueDate) {
      const [hh, mm] = dueTime.includes(":") ? dueTime.split(":") : ["19", "00"];
      const d = new Date(`${dueDate}T00:00:00`);
      d.setHours(parseInt(hh, 10) || 0, parseInt(mm, 10) || 0, 0, 0);
      dueAtISO = !isNaN(d.getTime()) ? d.toISOString() : new Date(dueDate).toISOString();

      if (reminder === "at_due") {
        reminderAtISO = dueAtISO;
      } else if (reminder === "5m" && !isNaN(d.getTime())) {
        reminderAtISO = new Date(d.getTime() - 5 * 60 * 1000).toISOString();
      } else if (reminder === "15m" && !isNaN(d.getTime())) {
        reminderAtISO = new Date(d.getTime() - 15 * 60 * 1000).toISOString();
      } else if (reminder === "30m" && !isNaN(d.getTime())) {
        reminderAtISO = new Date(d.getTime() - 30 * 60 * 1000).toISOString();
      } else if (reminder === "1h" && !isNaN(d.getTime())) {
        reminderAtISO = new Date(d.getTime() - 60 * 60 * 1000).toISOString();
      }
    }

    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category_id: categoryId || undefined,
      due_at: dueAtISO,
      reminder_at: reminderAtISO,
      start_at: planDate ? new Date(`${planDate}T00:00:00`).toISOString() : undefined,
      status: "todo",
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategoryId("");
    setDueDate("");
    setDueTime("19:00");
    setReminder("15m");
    setPlanDate("");
    setError("");
    onClose();
  };

  const categoryOptions = [
    { value: "", label: "No Category" },
    ...categories.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={t("header.quickAdd")}
      description="Quickly capture a task into your inbox or planned schedule."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Title"
          autoFocus
          value={title}
          onChange={(e) => {
            setTitle(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g., Review weekly lectures and notes"
          error={error}
        />

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-2 gap-3">
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
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Due Time"
            type="time"
            value={dueTime}
            onChange={(e) => setDueTime(e.target.value)}
            leftIcon={<Clock className="w-4 h-4 text-text-muted" />}
          />

          <Select
            label="Remind at"
            value={reminder}
            onChange={(e) => setReminder(e.target.value as any)}
            options={[
              { value: "none", label: "No reminder" },
              { value: "at_due", label: "At due time" },
              { value: "5m", label: "5 mins before" },
              { value: "15m", label: "15 mins before" },
              { value: "30m", label: "30 mins before" },
              { value: "1h", label: "1 hour before" },
            ]}
          />
        </div>

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any relevant notes or context..."
          rows={2}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(28,25,23,0.08)]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            {t("common.close")}
          </Button>
          <Button type="submit" variant="primary" size="sm">
            {t("header.quickAdd")}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
