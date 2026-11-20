import React, { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { FolderKanban, Plus, Calendar, ChevronRight, ArrowLeft } from "lucide-react";
import { useProjectStore } from "@/store/useProjectStore";
import { useTaskStore } from "@/store/useTaskStore";
import { TaskItem } from "@/components/tasks/TaskItem";
import { Button } from "@/components/ui/Button";
import { CreateProjectModal } from "@/components/projects/CreateProjectModal";

export const ProjectsPage: React.FC = () => {
  const { t } = useTranslation();
  const { projects, fetchProjects, selectedProjectId, setSelectedProjectId } =
    useProjectStore();
  const { tasks, fetchTasks, toggleTask, setSelectedTaskId, toggleDayPlan } =
    useTaskStore();

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const todayStr = new Date().toISOString().substring(0, 10);

  useEffect(() => {
    fetchProjects();
    fetchTasks();
  }, [fetchProjects, fetchTasks]);

  const activeProject = projects.find((p) => p.id === selectedProjectId);
  const projectTasks = tasks.filter((t) => t.project_id === selectedProjectId);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between p-5 rounded-2xl bg-background-card border border-border-subtle">
        <div className="flex items-center gap-3">
          {activeProject ? (
            <button
              onClick={() => setSelectedProjectId(null)}
              className="p-2 rounded-lg bg-background-elevated hover:bg-background-elevated/80 text-text-secondary hover:text-text-primary transition-colors"
            >
              <ArrowLeft className="w-4 h-4 rtl:rotate-180" />
            </button>
          ) : (
            <div className="w-10 h-10 rounded-xl bg-accent/15 text-accent flex items-center justify-center">
              <FolderKanban className="w-5 h-5" />
            </div>
          )}
          <div>
            <h1 className="text-lg font-bold text-text-primary tracking-tight">
              {activeProject ? activeProject.name : t("nav.projects")}
            </h1>
            <p className="text-xs text-text-secondary">
              {activeProject
                ? activeProject.description || "Manage project tasks and track progress"
                : `${projects.length} active projects`}
            </p>
          </div>
        </div>

        {!activeProject && (
          <Button
            variant="primary"
            size="sm"
            onClick={() => setIsCreateOpen(true)}
            leftIcon={<Plus className="w-4 h-4" />}
          >
            New Project
          </Button>
        )}
      </div>

      {activeProject ? (
        /* Selected Project View: Task list & Progress */
        <div className="space-y-6">
          <div className="p-6 rounded-2xl bg-background-card border border-border-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: activeProject.color || "#E99A43" }}
                />
                <span className="text-sm font-semibold text-text-primary">
                  Progress Overview
                </span>
              </div>
              <p className="text-xs text-text-secondary">
                {activeProject.completed_task_count} of {activeProject.task_count} tasks completed
              </p>
            </div>

            <div className="flex items-center gap-4">
              <div className="w-48 h-2 rounded-full bg-background-elevated overflow-hidden">
                <div
                  className="h-full bg-accent transition-all duration-300"
                  style={{ width: `${activeProject.progress_percent}%` }}
                />
              </div>
              <span className="text-sm font-bold text-accent">
                {activeProject.progress_percent}%
              </span>
            </div>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-semibold text-text-primary mb-3">
              Project Tasks ({projectTasks.length})
            </h3>
            {projectTasks.length === 0 ? (
              <div className="py-16 text-center text-xs text-text-secondary rounded-2xl bg-background-card/50 border border-border-subtle">
                No tasks assigned to this project yet. Use Quick Add or Task Details to assign tasks here.
              </div>
            ) : (
              projectTasks.map((task) => (
                <TaskItem
                  key={task.id}
                  task={task}
                  onToggle={toggleTask}
                  onSelect={setSelectedTaskId}
                  onToggleMyDay={() => toggleDayPlan(task.id, todayStr)}
                />
              ))
            )}
          </div>
        </div>
      ) : (
        /* Project Grid */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {projects.length === 0 ? (
            <div className="col-span-full py-16 text-center rounded-2xl bg-background-card/50 border border-border-subtle flex flex-col items-center">
              <div className="w-12 h-12 rounded-full bg-background-elevated flex items-center justify-center text-text-muted mb-3">
                <FolderKanban className="w-6 h-6 text-accent" />
              </div>
              <h3 className="text-sm font-semibold text-text-primary mb-1">
                No projects created yet
              </h3>
              <p className="text-xs text-text-secondary max-w-sm mb-4">
                Create a project to bundle related tasks, track milestones, and view completion rates.
              </p>
              <Button
                variant="primary"
                size="sm"
                onClick={() => setIsCreateOpen(true)}
              >
                Create First Project
              </Button>
            </div>
          ) : (
            projects.map((project) => (
              <div
                key={project.id}
                onClick={() => setSelectedProjectId(project.id)}
                className="p-5 rounded-2xl bg-background-card border border-border-subtle hover:border-accent/40 hover:bg-background-card/90 cursor-pointer transition-all flex flex-col justify-between group"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span
                      className="w-3.5 h-3.5 rounded-full"
                      style={{ backgroundColor: project.color || "#E99A43" }}
                    />
                    <ChevronRight className="w-4 h-4 text-text-muted group-hover:text-text-primary group-hover:translate-x-0.5 rtl:group-hover:-translate-x-0.5 transition-all" />
                  </div>

                  <h3 className="text-base font-semibold text-text-primary tracking-tight mb-1">
                    {project.name}
                  </h3>
                  {project.description && (
                    <p className="text-xs text-text-secondary line-clamp-2 mb-4 leading-relaxed">
                      {project.description}
                    </p>
                  )}
                </div>

                <div className="pt-4 border-t border-border-subtle/50 mt-4 space-y-2">
                  <div className="flex items-center justify-between text-xs text-text-secondary">
                    <span>Progress</span>
                    <span className="font-semibold text-accent">
                      {project.progress_percent}%
                    </span>
                  </div>
                  <div className="w-full h-1.5 rounded-full bg-background-elevated overflow-hidden">
                    <div
                      className="h-full bg-accent transition-all duration-300"
                      style={{ width: `${project.progress_percent}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-text-muted pt-1">
                    <span>{project.task_count} tasks</span>
                    {project.due_at && (
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {new Intl.DateTimeFormat(undefined, {
                          month: "short",
                          day: "numeric",
                        }).format(new Date(project.due_at))}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      <CreateProjectModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
