import type { TaskStats } from "../types";

export function StatsBar({ stats }: { stats: TaskStats }) {
  const tiles: { label: string; value: number }[] = [
    { label: "Total", value: stats.total },
    { label: "To do", value: stats.todo },
    { label: "In progress", value: stats.in_progress },
    { label: "Done", value: stats.done },
  ];

  return (
    <div className="stats-bar">
      {tiles.map((tile) => (
        <div className="stat-tile" key={tile.label}>
          <div className="stat-value">{tile.value}</div>
          <div className="stat-label">{tile.label}</div>
        </div>
      ))}
    </div>
  );
}
