import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTaskStore } from "@/store/useTaskStore";
import { useCategoryStore } from "@/store/useCategoryStore";
import type { Priority } from "@shared/types/database";
import { Calendar, Sun } from "lucide-react";

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

    await createTask({
      title: title.trim(),
      description: description.trim() || undefined,
      priority,
      category_id: categoryId || undefined,
      due_at: dueDate ? new Date(dueDate).toISOString() : undefined,
      start_at: planDate ? new Date(planDate).toISOString() : undefined,
      status: "todo",
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setCategoryId("");
    setDueDate("");
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
