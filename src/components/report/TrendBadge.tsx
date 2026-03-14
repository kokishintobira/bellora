import { formatGrowthRate } from "@/lib/format";

export function TrendBadge({ growthRate }: { growthRate: number }) {
  const isPositive = growthRate >= 0;
  const isNeutral = Math.abs(growthRate) < 0.02;

  const bgClass = isNeutral
    ? "bg-accent-yellow/15 text-accent-yellow"
    : isPositive
      ? "bg-accent/15 text-accent"
      : "bg-accent-red/15 text-accent-red";

  return (
    <span
      className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 font-mono text-xs font-semibold ${bgClass}`}
    >
      {!isNeutral && (
        <svg
          width="10"
          height="10"
          viewBox="0 0 10 10"
          fill="currentColor"
          className={!isPositive ? "rotate-180" : ""}
        >
          <path d="M5 1L9 7H1L5 1Z" />
        </svg>
      )}
      {formatGrowthRate(growthRate)}
    </span>
  );
}
