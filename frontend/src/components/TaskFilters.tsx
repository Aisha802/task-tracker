import type { TaskFilters as TaskFiltersState } from "../api/tasks";

interface TaskFiltersProps {
  filters: TaskFiltersState;
  onChange: (filters: TaskFiltersState) => void;
}

export function TaskFilters({ filters, onChange }: TaskFiltersProps) {
  return (
    <div className="filters-bar">
      <select
        value={filters.status ?? "all"}
        onChange={(e) => onChange({ ...filters, status: e.target.value as TaskFiltersState["status"] })}
        aria-label="Filter by status"
      >
        <option value="all">All statuses</option>
        <option value="todo">To do</option>
        <option value="in_progress">In progress</option>
        <option value="done">Done</option>
      </select>

      <select
        value={filters.priority ?? "all"}
        onChange={(e) => onChange({ ...filters, priority: e.target.value as TaskFiltersState["priority"] })}
        aria-label="Filter by priority"
      >
        <option value="all">All priorities</option>
        <option value="high">High</option>
        <option value="medium">Medium</option>
        <option value="low">Low</option>
      </select>

      <select
        value={filters.sortBy ?? "created_at"}
        onChange={(e) => onChange({ ...filters, sortBy: e.target.value as TaskFiltersState["sortBy"] })}
        aria-label="Sort by"
      >
        <option value="created_at">Newest first</option>
        <option value="due_date">Due date</option>
        <option value="priority">Priority</option>
        <option value="title">Title</option>
      </select>
    </div>
  );
}
