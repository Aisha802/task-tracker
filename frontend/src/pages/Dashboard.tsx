import { useCallback, useEffect, useState } from "react";
import { Brand } from "../components/Brand";
import { StatsBar } from "../components/StatsBar";
import { TaskFilters } from "../components/TaskFilters";
import { TaskForm } from "../components/TaskForm";
import { TaskCard } from "../components/TaskCard";
import { useAuth } from "../context/AuthContext";
import * as tasksApi from "../api/tasks";
import type { TaskFilters as TaskFiltersState } from "../api/tasks";
import type { Task, TaskStats, TaskStatus } from "../types";

export function Dashboard() {
  const { user, logout } = useAuth();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [stats, setStats] = useState<TaskStats | null>(null);
  const [filters, setFilters] = useState<TaskFiltersState>({ sortBy: "created_at" });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    setError(null);
    try {
      const [taskList, taskStats] = await Promise.all([
        tasksApi.listTasks(filters),
        tasksApi.getTaskStats(),
      ]);
      setTasks(taskList);
      setStats(taskStats);
    } catch {
      setError("Could not load your tasks. Try refreshing.");
    } finally {
      setIsLoading(false);
    }
  }, [filters]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  async function handleCreate(input: Parameters<typeof tasksApi.createTask>[0]) {
    await tasksApi.createTask(input);
    await refresh();
  }

  async function handleStatusChange(id: number, status: TaskStatus) {
    setTasks((current) => current.map((t) => (t.id === id ? { ...t, status } : t)));
    try {
      await tasksApi.updateTask(id, { status });
      await refresh();
    } catch {
      setError("Could not update that task.");
      await refresh();
    }
  }

  async function handleDelete(id: number) {
    setTasks((current) => current.filter((t) => t.id !== id));
    try {
      await tasksApi.deleteTask(id);
      await refresh();
    } catch {
      setError("Could not delete that task.");
      await refresh();
    }
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <Brand />
        <div className="header-right">
          {user && <span className="user-email">{user.email}</span>}
          <button className="btn btn-secondary" onClick={logout}>
            Log out
          </button>
        </div>
      </div>

      {error && <div className="error-banner">{error}</div>}
      {stats && <StatsBar stats={stats} />}

      <TaskForm onCreate={handleCreate} />

      <div className="panel">
        <h2>Your tasks</h2>
        <TaskFilters filters={filters} onChange={setFilters} />

        {isLoading ? (
          <div className="empty-state">Loading tasks…</div>
        ) : tasks.length === 0 ? (
          <div className="empty-state">Nothing here yet — add your first task above.</div>
        ) : (
          <div className="task-list">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onStatusChange={handleStatusChange}
                onDelete={handleDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
