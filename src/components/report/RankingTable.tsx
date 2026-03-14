import Link from "next/link";
import type { ToolWeeklyStats, Tool } from "@/types";
import { formatNumber } from "@/lib/format";
import { TrendBadge } from "./TrendBadge";
import { SentimentIndicator } from "./SentimentIndicator";

export function RankingTable({
  rankings,
  tools,
}: {
  rankings: ToolWeeklyStats[];
  tools: Tool[];
}) {
  const toolMap = new Map(tools.map((t) => [t.slug, t]));

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-border text-left text-xs text-foreground-muted">
            <th className="pb-3 pr-3 font-medium">#</th>
            <th className="pb-3 pr-3 font-medium">ツール</th>
            <th className="pb-3 pr-3 text-right font-medium">メンション数</th>
            <th className="pb-3 pr-3 text-right font-medium">前週比</th>
            <th className="hidden pb-3 pr-3 font-medium sm:table-cell">
              センチメント
            </th>
          </tr>
        </thead>
        <tbody>
          {rankings.map((stat, i) => {
            const tool = toolMap.get(stat.toolSlug);
            return (
              <tr
                key={stat.toolSlug}
                className="border-b border-border/50 transition hover:bg-surface/50"
              >
                <td className="py-3 pr-3 font-mono text-foreground-muted">
                  {i + 1}
                </td>
                <td className="py-3 pr-3">
                  <Link
                    href={`/tools/${stat.toolSlug}`}
                    className="font-medium text-foreground hover:text-primary"
                  >
                    {tool?.name ?? stat.toolSlug}
                  </Link>
                  {tool && (
                    <span className="ml-2 text-xs text-foreground-muted">
                      {tool.vendor}
                    </span>
                  )}
                </td>
                <td className="py-3 pr-3 text-right font-mono">
                  {formatNumber(stat.mentionCount)}
                </td>
                <td className="py-3 pr-3 text-right">
                  <TrendBadge growthRate={stat.growthRate} />
                </td>
                <td className="hidden w-40 py-3 pr-3 sm:table-cell">
                  <SentimentIndicator sentiment={stat.sentimentBreakdown} />
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
