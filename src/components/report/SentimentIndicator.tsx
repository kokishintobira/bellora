import type { SentimentBreakdown } from "@/types";

export function SentimentIndicator({
  sentiment,
}: {
  sentiment: SentimentBreakdown;
}) {
  const pctPos = Math.round(sentiment.positive * 100);
  const pctNeu = Math.round(sentiment.neutral * 100);
  const pctNeg = Math.round(sentiment.negative * 100);

  return (
    <div className="flex flex-col gap-1.5">
      <div className="flex h-2 w-full overflow-hidden rounded-full">
        <div
          className="bg-accent"
          style={{ width: `${pctPos}%` }}
          title={`Positive: ${pctPos}%`}
        />
        <div
          className="bg-accent-yellow"
          style={{ width: `${pctNeu}%` }}
          title={`Neutral: ${pctNeu}%`}
        />
        <div
          className="bg-accent-red"
          style={{ width: `${pctNeg}%` }}
          title={`Negative: ${pctNeg}%`}
        />
      </div>
      <div className="flex gap-3 text-[10px] text-foreground-muted">
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent" />
          {pctPos}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-yellow" />
          {pctNeu}%
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-1.5 w-1.5 rounded-full bg-accent-red" />
          {pctNeg}%
        </span>
      </div>
    </div>
  );
}
