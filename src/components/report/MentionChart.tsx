import type { ToolWeeklyStats } from "@/types";
import { formatNumber } from "@/lib/format";

export function MentionChart({
  rankings,
  maxItems = 10,
}: {
  rankings: ToolWeeklyStats[];
  maxItems?: number;
}) {
  const items = rankings.slice(0, maxItems);
  const maxCount = Math.max(...items.map((r) => r.mentionCount));

  return (
    <div className="flex flex-col gap-2">
      {items.map((item, i) => {
        const widthPct = (item.mentionCount / maxCount) * 100;
        return (
          <div key={item.toolSlug} className="flex items-center gap-3">
            <span className="w-5 text-right font-mono text-xs text-foreground-muted">
              {i + 1}
            </span>
            <div className="flex-1">
              <div
                className="h-6 rounded bg-primary/80 transition-all"
                style={{ width: `${widthPct}%`, minWidth: "2rem" }}
              />
            </div>
            <span className="w-16 text-right font-mono text-xs text-foreground-muted">
              {formatNumber(item.mentionCount)}
            </span>
          </div>
        );
      })}
    </div>
  );
}
