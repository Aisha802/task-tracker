import { apiRequest } from "./client";
import type { Task, TaskCreateInput, TaskStats, TaskStatus, TaskUpdateInput } from "../types";

export interface TaskFilters {
  status?: TaskStatus | "all";
  priority?: "low" | "medium" | "high" | "all";
  sortBy?: "created_at" | "due_date" | "priority" | "title";
}

export function listTasks(filters: TaskFilters = {}): Promise<Task[]> {
  const params = new URLSearchParams();
  if (filters.status && filters.status !== "all") params.set("status_filter", filters.status);
  if (filters.priority && filters.priority !== "all") params.set("priority", filters.priority);
  if (filters.sortBy) params.set("sort_by", filters.sortBy);

  const query = params.toString();
  return apiRequest<Task[]>(`/tasks${query ? `?${query}` : ""}`);
}

export function getTaskStats(): Promise<TaskStats> {
  return apiRequest<TaskStats>("/tasks/stats");
}

export function createTask(input: TaskCreateInput): Promise<Task> {
  return apiRequest<Task>("/tasks", { method: "POST", body: input });
}

export function updateTask(id: number, input: TaskUpdateInput): Promise<Task> {
  return apiRequest<Task>(`/tasks/${id}`, { method: "PUT", body: input });
}

export function deleteTask(id: number): Promise<void> {
  return apiRequest<void>(`/tasks/${id}`, { method: "DELETE" });
}
