import { describe, it, expect, beforeEach } from "vitest";
import React from "react";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import type { TaskWithDetails } from "@/shared/types/database";

describe("Phase 3 - Core Task UI", () => {
  beforeEach(() => {
    useTaskStore.setState({ tasks: [], selectedTaskId: null });
  });

  it("creates a task and updates the store state", async () => {
    const { createTask, tasks } = useTaskStore.getState();
    expect(tasks).toHaveLength(0);

    await createTask({
      title: "Write documentation",
      priority: "high",
      status: "todo",
    });

    const updatedTasks = useTaskStore.getState().tasks;
    expect(updatedTasks).toHaveLength(1);
    expect(updatedTasks[0].title).toBe("Write documentation");
    expect(updatedTasks[0].priority).toBe("high");
  });

  it("toggles task status in TaskItem component", () => {
    const mockTask: TaskWithDetails = {
      id: "task-1",
      title: "Design logo",
      description: null,
      status: "todo",
      priority: "medium",
      project_id: null,
      category_id: null,
      start_at: null,
      due_at: null,
      completed_at: null,
      recurrence_rule: null,
      recurrence_series_id: null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      archived_at: null,
      deleted_at: null,
      subtasks: [],
      tags: [],
    };

    let toggledId = "";
    let selectedId = "";

    const { rerender } = render(
      <TaskItem
        task={mockTask}
        onToggle={(id) => {
          toggledId = id;
        }}
        onSelect={(id) => {
          selectedId = id;
        }}
      />
    );

    expect(screen.getByText("Design logo")).toBeDefined();

    // Toggle button
    const toggleBtn = screen.getByRole("button", { name: /mark as complete/i });
    fireEvent.click(toggleBtn);
    expect(toggledId).toBe("task-1");

    // Click row
    fireEvent.click(screen.getByText("Design logo"));
    expect(selectedId).toBe("task-1");

    // Rerender as done
    rerender(
      <TaskItem
        task={{ ...mockTask, status: "done" }}
        onToggle={() => {}}
        onSelect={() => {}}
      />
    );

    expect(screen.getByRole("button", { name: /mark as incomplete/i })).toBeDefined();
  });
});
