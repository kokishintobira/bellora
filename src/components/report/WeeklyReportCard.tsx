import Link from "next/link";
import type { WeeklyReport } from "@/types";
import { formatNumber, formatDate, weekSlugToDateRange } from "@/lib/format";

export function WeeklyReportCard({ report }: { report: WeeklyReport }) {
  const dateRange = weekSlugToDateRange(report.weekSlug);
  const top3 = report.rankings.slice(0, 3);

  return (
    <Link
      href={`/reports/${report.weekSlug}`}
      className="block rounded-xl border border-border bg-surface p-5 transition hover:border-primary/40"
    >
      <div className="flex items-baseline justify-between">
        <h3 className="font-bold">{report.weekLabel}</h3>
        <span className="text-xs text-foreground-muted">{dateRange}</span>
      </div>
      <p className="mt-2 text-xs text-foreground-muted">
        {formatNumber(report.totalTweetsAnalyzed)}件のポストを分析
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        {top3.map((stat, i) => (
          <span
            key={stat.toolSlug}
            className="inline-flex items-center gap-1 rounded bg-muted px-2 py-1 text-xs"
          >
            <span className="font-mono text-foreground-muted">{i + 1}.</span>
            <span className="font-medium">{stat.toolSlug}</span>
          </span>
        ))}
      </div>
      <p className="mt-3 line-clamp-2 text-xs leading-relaxed text-foreground-muted">
        {report.summary}
      </p>
      <p className="mt-2 text-[10px] text-foreground-muted/60">
        {formatDate(report.generatedAt)}
      </p>
    </Link>
  );
}
