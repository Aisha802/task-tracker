export type TaskStatus = "todo" | "in_progress" | "done";
export type TaskPriority = "low" | "medium" | "high";

export interface Task {
  id: number;
  title: string;
  description: string | null;
  due_date: string | null;
  priority: TaskPriority;
  status: TaskStatus;
  created_at: string;
  updated_at: string;
}

export interface TaskCreateInput {
  title: string;
  description?: string | null;
  due_date?: string | null;
  priority?: TaskPriority;
  status?: TaskStatus;
}

export type TaskUpdateInput = Partial<TaskCreateInput>;

export interface TaskStats {
  todo: number;
  in_progress: number;
  done: number;
  total: number;
}

export interface User {
  id: number;
  email: string;
  created_at: string;
}
