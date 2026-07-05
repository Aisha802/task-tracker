import { useState, type FormEvent } from "react";
import type { TaskCreateInput, TaskPriority } from "../types";

interface TaskFormProps {
  onCreate: (input: TaskCreateInput) => Promise<void>;
}

export function TaskForm({ onCreate }: TaskFormProps) {
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [dueDate, setDueDate] = useState("");
  const [priority, setPriority] = useState<TaskPriority>("medium");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!title.trim()) {
      setError("Give the task a title.");
      return;
    }
    setError(null);
    setIsSubmitting(true);
    try {
      await onCreate({
        title: title.trim(),
        description: description.trim() || null,
        due_date: dueDate || null,
        priority,
      });
      setTitle("");
      setDescription("");
      setDueDate("");
      setPriority("medium");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not create the task.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="panel" onSubmit={handleSubmit}>
      <h2>New task</h2>
      {error && <div className="error-banner">{error}</div>}
      <div className="form-grid">
        <div className="field full">
          <label htmlFor="title">Title</label>
          <input
            id="title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Write the project README"
          />
        </div>
        <div className="field full">
          <label htmlFor="description">Description (optional)</label>
          <textarea
            id="description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Add any useful detail"
          />
        </div>
        <div className="field">
          <label htmlFor="due_date">Due date</label>
          <input
            id="due_date"
            type="date"
            value={dueDate}
            onChange={(e) => setDueDate(e.target.value)}
          />
        </div>
        <div className="field">
          <label htmlFor="priority">Priority</label>
          <select
            id="priority"
            value={priority}
            onChange={(e) => setPriority(e.target.value as TaskPriority)}
          >
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="field" style={{ display: "flex", alignItems: "flex-end" }}>
          <button className="btn btn-primary" type="submit" disabled={isSubmitting}>
            {isSubmitting ? "Adding…" : "Add task"}
          </button>
        </div>
      </div>
    </form>
  );
}
