import React, { useState } from "react";
import { useTranslation } from "react-i18next";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Select } from "../ui/Select";
import { Button } from "../ui/Button";

interface QuickAddModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd?: (task: { title: string; description: string; priority: string }) => void;
}

export const QuickAddModal: React.FC<QuickAddModalProps> = ({
  isOpen,
  onClose,
  onAdd,
}) => {
  const { t } = useTranslation();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [priority, setPriority] = useState("medium");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError("Task title is required");
      return;
    }

    if (onAdd) {
      onAdd({ title: title.trim(), description: description.trim(), priority });
    }

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
          onChange={(e) => setPriority(e.target.value)}
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
