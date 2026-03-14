import type { ToolWeekEntry } from "@/types";

export function ToolHistoryChart({ weeks }: { weeks: ToolWeekEntry[] }) {
  if (weeks.length === 0) return null;

  const counts = weeks.map((w) => w.mentionCount);
  const max = Math.max(...counts);
  const min = Math.min(...counts);
  const range = max - min || 1;

  const width = 280;
  const height = 60;
  const padding = 4;

  const points = counts.map((count, i) => {
    const x = padding + (i / (counts.length - 1 || 1)) * (width - padding * 2);
    const y = height - padding - ((count - min) / range) * (height - padding * 2);
    return { x, y };
  });

  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`)
    .join(" ");

  return (
    <div className="flex flex-col gap-1">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="w-full"
        preserveAspectRatio="none"
      >
        <path d={pathD} fill="none" stroke="#3B82F6" strokeWidth="2" />
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r="3" fill="#3B82F6" />
        ))}
      </svg>
      <div className="flex justify-between text-[10px] text-foreground-muted">
        {weeks.length > 0 && <span>{weeks[0].weekSlug}</span>}
        {weeks.length > 1 && <span>{weeks[weeks.length - 1].weekSlug}</span>}
      </div>
    </div>
  );
}
