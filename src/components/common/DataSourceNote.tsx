import { formatNumber } from "@/lib/format";

export function DataSourceNote({ tweetCount }: { tweetCount: number }) {
  return (
    <p className="text-xs text-foreground-muted">
      <svg
        className="mr-1 inline-block h-3.5 w-3.5 align-text-bottom"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
        <polyline points="22,6 12,13 2,6" />
      </svg>
      X上の{formatNumber(tweetCount)}件のポストを分析
    </p>
  );
}
