import { TaskRepository } from "../../database/repositories/taskRepository";
import type {
  CreateTaskInput,
  UpdateTaskInput,
  TaskFilterParams,
  TaskWithDetails,
} from "../../shared/types/database";

export class TaskService {
  constructor(private repo: TaskRepository) {}

  createTask(input: CreateTaskInput): TaskWithDetails {
    return this.repo.create(input);
  }

  getTask(id: string): TaskWithDetails | null {
    return this.repo.getById(id);
  }

  listTasks(filters?: TaskFilterParams): TaskWithDetails[] {
    return this.repo.list(filters);
  }

  updateTask(id: string, input: UpdateTaskInput): TaskWithDetails | null {
    // Check if updating status to done
    if (input.status === "done" && input.completed_at === undefined) {
      input.completed_at = new Date().toISOString();
    } else if (
      input.status &&
      input.status !== "done" &&
      input.completed_at === undefined
    ) {
      input.completed_at = null;
    }

    const updated = this.repo.update(id, input);

    // If task has recurrence and was completed, schedule next occurrence
    if (updated && updated.status === "done" && updated.recurrence_rule) {
      this.generateNextRecurrence(updated);
    }

    return updated;
  }

  toggleTask(id: string): TaskWithDetails | null {
    const task = this.repo.getById(id);
    if (!task) return null;

    const nextStatus = task.status === "done" ? "todo" : "done";
    return this.updateTask(id, { status: nextStatus });
  }

  deleteTask(id: string): boolean {
    return this.repo.delete(id);
  }

  toggleDayPlan(taskId: string, planDate: string): boolean {
    return this.repo.toggleDayPlan(taskId, planDate);
  }

  // Dependencies with cycle prevention
  addDependency(taskId: string, dependsOnTaskId: string): { success: boolean; error?: string } {
    if (taskId === dependsOnTaskId) {
      return { success: false, error: "A task cannot depend on itself." };
    }

    // Check for circular dependency
    if (this.wouldCauseCycle(taskId, dependsOnTaskId)) {
      return {
        success: false,
        error: "Circular dependency detected: adding this would create a cycle.",
      };
    }

    this.repo.addDependency(taskId, dependsOnTaskId);
    return { success: true };
  }

  removeDependency(taskId: string, dependsOnTaskId: string): void {
    this.repo.removeDependency(taskId, dependsOnTaskId);
  }

  private wouldCauseCycle(sourceId: string, targetId: string): boolean {
    // DFS to check if path from targetId reaches sourceId
    const visited = new Set<string>();
    const stack = [targetId];

    while (stack.length > 0) {
      const current = stack.pop()!;
      if (current === sourceId) {
        return true;
      }

      if (!visited.has(current)) {
        visited.add(current);
        const deps = this.repo.getDependencies(current);
        for (const next of deps) {
          stack.push(next);
        }
      }
    }

    return false;
  }

  private generateNextRecurrence(task: TaskWithDetails): void {
    if (!task.recurrence_rule) return;

    let nextDue: Date | null = null;
    const baseDate = task.due_at ? new Date(task.due_at) : new Date();

    switch (task.recurrence_rule.toLowerCase()) {
      case "daily":
        nextDue = new Date(baseDate);
        nextDue.setDate(nextDue.getDate() + 1);
        break;
      case "weekly":
        nextDue = new Date(baseDate);
        nextDue.setDate(nextDue.getDate() + 7);
        break;
      case "monthly":
        nextDue = new Date(baseDate);
        nextDue.setMonth(nextDue.getMonth() + 1);
        break;
      case "yearly":
        nextDue = new Date(baseDate);
        nextDue.setFullYear(nextDue.getFullYear() + 1);
        break;
      default:
        break;
    }

    if (nextDue) {
      this.repo.create({
        title: task.title,
        description: task.description || undefined,
        status: "todo",
        priority: task.priority,
        project_id: task.project_id || undefined,
        category_id: task.category_id || undefined,
        due_at: nextDue.toISOString(),
        recurrence_rule: task.recurrence_rule,
        subtasks: task.subtasks.map((s) => s.title),
      });
    }
  }

  reorderTasks(taskIds: string[]): void {
    this.repo.reorder(taskIds);
  }

  reorderSubtasks(taskId: string, subtaskIds: string[]): void {
    this.repo.reorderSubtasks(taskId, subtaskIds);
  }

  addSubtask(taskId: string, title: string) {
    return this.repo.addSubtask(taskId, title);
  }

  toggleSubtask(subtaskId: string, completed?: boolean) {
    return this.repo.toggleSubtask(subtaskId, completed);
  }

  updateSubtask(subtaskId: string, title: string) {
    return this.repo.updateSubtask(subtaskId, title);
  }

  deleteSubtask(subtaskId: string): boolean {
    return this.repo.deleteSubtask(subtaskId);
  }
}
