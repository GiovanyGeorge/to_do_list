import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";
import { useTaskStore } from "@/store/useTaskStore";
import type { Priority } from "@shared/types/database";

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
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState<Priority>("medium");
  const [error, setError] = useState("");

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
      status: "todo",
    });

    setTitle("");
    setDescription("");
    setPriority("medium");
    setError("");
    onClose();
  };

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
          placeholder="e.g., Review project quarterly report"
          error={error}
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Add any relevant notes, links, or context..."
          rows={3}
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

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-border-subtle/50">
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
