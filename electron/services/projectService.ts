import { ProjectRepository } from "../../database/repositories/projectRepository";
import type {
  CreateProjectInput,
  UpdateProjectInput,
  ProjectWithStats,
} from "../../shared/types/database";

export class ProjectService {
  constructor(private repo: ProjectRepository) {}

  createProject(input: CreateProjectInput): ProjectWithStats {
    return this.repo.create(input);
  }

  getProject(id: string): ProjectWithStats | null {
    return this.repo.getById(id);
  }

  listProjects(includeArchived = false): ProjectWithStats[] {
    return this.repo.list(includeArchived);
  }

  updateProject(id: string, input: UpdateProjectInput): ProjectWithStats | null {
    return this.repo.update(id, input);
  }

  deleteProject(id: string): boolean {
    return this.repo.delete(id);
  }

  archiveProject(id: string): ProjectWithStats | null {
    return this.repo.update(id, {
      archived_at: new Date().toISOString(),
      status: "archived",
    });
  }

  restoreProject(id: string): ProjectWithStats | null {
    return this.repo.update(id, {
      archived_at: null,
      status: "active",
    });
  }
}
