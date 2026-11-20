import React, { useState } from "react";
import { Modal } from "../ui/Modal";
import { Input, Textarea } from "../ui/Input";
import { Button } from "../ui/Button";
import { useProjectStore } from "@/store/useProjectStore";

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const PROJECT_COLORS = [
  "#C2410C", // Terracotta
  "#15803D", // Green
  "#7C3AED", // Purple
  "#EA580C", // Muted orange
  "#0D9488", // Teal
  "#E11D48", // Rose
  "#D97706", // Amber
  "#475569", // Slate
];

export const CreateProjectModal: React.FC<CreateProjectModalProps> = ({
  isOpen,
  onClose,
}) => {
  const { createProject } = useProjectStore();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [color, setColor] = useState(PROJECT_COLORS[0]);
  const [dueDate, setDueDate] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      setError("Project name is required");
      return;
    }

    await createProject({
      name: name.trim(),
      description: description.trim() || undefined,
      color,
      due_at: dueDate ? new Date(dueDate).toISOString() : undefined,
    });

    setName("");
    setDescription("");
    setColor(PROJECT_COLORS[0]);
    setDueDate("");
    setError("");
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Project"
      description="Organize related tasks under a milestone-driven project."
      maxWidth="md"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          label="Project Name"
          autoFocus
          value={name}
          onChange={(e) => {
            setName(e.target.value);
            if (error) setError("");
          }}
          placeholder="e.g., Desktop App Launch"
          error={error}
        />

        <Textarea
          label="Description (optional)"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="What is this project aiming to achieve?"
          rows={3}
        />

        <div>
          <label className="block text-xs font-medium text-text-secondary mb-2">
            Project Color
          </label>
          <div className="flex items-center gap-2">
            {PROJECT_COLORS.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setColor(c)}
                style={{ backgroundColor: c }}
                className={`w-7 h-7 rounded-full border-2 transition-all ${
                  color === c
                    ? "scale-110 border-white shadow-md ring-2 ring-accent/40"
                    : "border-transparent opacity-80 hover:opacity-100 hover:scale-105"
                }`}
              />
            ))}
          </div>
        </div>

        <Input
          label="Due Date (optional)"
          type="date"
          value={dueDate}
          onChange={(e) => setDueDate(e.target.value)}
        />

        <div className="flex items-center justify-end gap-3 pt-3 border-t border-[rgba(28,25,23,0.08)]">
          <Button type="button" variant="outline" size="sm" onClick={onClose}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm">
            Create Project
          </Button>
        </div>
      </form>
    </Modal>
  );
};
