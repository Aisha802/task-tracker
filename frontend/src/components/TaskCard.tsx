import type { Task, TaskStatus } from "../types";

interface TaskCardProps {
  task: Task;
  onStatusChange: (id: number, status: TaskStatus) => void;
  onDelete: (id: number) => void;
}

function formatDate(value: string | null): string | null {
  if (!value) return null;
  return new Date(value).toLocaleDateString(undefined, { month: "short", day: "numeric" });
}

export function TaskCard({ task, onStatusChange, onDelete }: TaskCardProps) {
  const dueLabel = formatDate(task.due_date);

  return (
    <div className="task-card">
      <span className={`signal-dot status-${task.status}`} aria-hidden="true" />
      <div className="task-main">
        <div className="task-title-row">
          <span className={`task-title ${task.status === "done" ? "done" : ""}`}>{task.title}</span>
          <span className={`priority-tag ${task.priority}`}>{task.priority}</span>
        </div>
        {task.description && <p className="task-description">{task.description}</p>}
        {dueLabel && (
          <div className="task-meta">
            <span>Due {dueLabel}</span>
          </div>
        )}
      </div>
      <div className="task-actions">
        <select
          value={task.status}
          onChange={(e) => onStatusChange(task.id, e.target.value as TaskStatus)}
          aria-label={`Change status for ${task.title}`}
        >
          <option value="todo">To do</option>
          <option value="in_progress">In progress</option>
          <option value="done">Done</option>
        </select>
        <button className="icon-btn" onClick={() => onDelete(task.id)} aria-label={`Delete ${task.title}`}>
          Delete
        </button>
      </div>
    </div>
  );
}
