import type { TweetData } from "@/types";
import { formatNumber } from "@/lib/format";

export function KeyTweetCard({ tweet }: { tweet: TweetData }) {
  return (
    <div className="rounded-xl border border-border bg-surface p-4">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted text-xs font-bold text-foreground-muted">
          {tweet.authorName.charAt(0)}
        </div>
        <div>
          <p className="text-sm font-medium">{tweet.authorName}</p>
          <p className="text-xs text-foreground-muted">@{tweet.authorUsername}</p>
        </div>
      </div>
      <p className="mt-3 text-sm leading-relaxed">{tweet.text}</p>
      <div className="mt-3 flex gap-4 text-xs text-foreground-muted">
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
          </svg>
          {formatNumber(tweet.likeCount)}
        </span>
        <span className="flex items-center gap-1">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="17 1 21 5 17 9" />
            <path d="M3 11V9a4 4 0 0 1 4-4h14" />
            <polyline points="7 23 3 19 7 15" />
            <path d="M21 13v2a4 4 0 0 1-4 4H3" />
          </svg>
          {formatNumber(tweet.retweetCount)}
        </span>
      </div>
    </div>
  );
}
