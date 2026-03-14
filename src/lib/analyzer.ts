import type {
  TweetData,
  ToolWeeklyStats,
  SentimentBreakdown,
  WeeklyReport,
} from "@/types";
import { weekSlugToLabel } from "@/lib/format";

/* ───── Keyword-based Sentiment ───── */

const POSITIVE_KEYWORDS = [
  "すごい", "最高", "便利", "神", "革命", "感動", "素晴らしい", "良い",
  "使いやすい", "効率", "おすすめ", "love", "amazing", "great", "awesome",
  "helpful", "powerful", "impressive", "game changer", "excellent",
];

const NEGATIVE_KEYWORDS = [
  "ダメ", "使えない", "微妙", "改悪", "遅い", "バグ", "不具合", "エラー",
  "高い", "がっかり", "bad", "terrible", "broken", "useless", "slow",
  "expensive", "disappointed", "worse", "frustrating",
];

function analyzeSentiment(text: string): "positive" | "neutral" | "negative" {
  const lower = text.toLowerCase();
  const posCount = POSITIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length;
  const negCount = NEGATIVE_KEYWORDS.filter((kw) => lower.includes(kw)).length;

  if (posCount > negCount) return "positive";
  if (negCount > posCount) return "negative";
  return "neutral";
}

function computeSentimentBreakdown(tweets: TweetData[]): SentimentBreakdown {
  if (tweets.length === 0) {
    return { positive: 0.33, neutral: 0.34, negative: 0.33 };
  }

  let pos = 0;
  let neu = 0;
  let neg = 0;

  for (const tweet of tweets) {
    const s = analyzeSentiment(tweet.text);
    if (s === "positive") pos++;
    else if (s === "negative") neg++;
    else neu++;
  }

  const total = tweets.length;
  return {
    positive: Math.round((pos / total) * 100) / 100,
    neutral: Math.round((neu / total) * 100) / 100,
    negative: Math.round((neg / total) * 100) / 100,
  };
}

/* ───── Analyze Tool Tweets ───── */

export function analyzeToolTweets(
  tweets: TweetData[],
  toolSlug: string,
  previousMentionCount?: number
): ToolWeeklyStats {
  const mentionCount = tweets.length;
  const growthRate =
    previousMentionCount != null && previousMentionCount > 0
      ? (mentionCount - previousMentionCount) / previousMentionCount
      : 0;

  const sentimentBreakdown = computeSentimentBreakdown(tweets);

  // Top tweets by engagement (likes + retweets)
  const topTweets = [...tweets]
    .sort((a, b) => b.likeCount + b.retweetCount - (a.likeCount + a.retweetCount))
    .slice(0, 3);

  return {
    toolSlug,
    mentionCount,
    growthRate: Math.round(growthRate * 100) / 100,
    sentimentBreakdown,
    topTweets,
  };
}

/* ───── Build Weekly Report ───── */

export function buildWeeklyReport(
  weekSlug: string,
  allStats: ToolWeeklyStats[],
  totalTweets: number
): WeeklyReport {
  // Sort by mention count descending
  const rankings = [...allStats].sort(
    (a, b) => b.mentionCount - a.mentionCount
  );

  // Generate summary
  const top3 = rankings.slice(0, 3);
  const fastestGrower = [...rankings].sort(
    (a, b) => b.growthRate - a.growthRate
  )[0];

  const summary = `今週のAIツールトレンド分析。${top3.map((s) => s.toolSlug).join("、")}がトップ3にランクイン。` +
    (fastestGrower
      ? `成長率では${fastestGrower.toolSlug}が${(fastestGrower.growthRate * 100).toFixed(0)}%増と最も注目されている。`
      : "");

  // Generate highlights
  const highlights: string[] = [];
  if (rankings[0]) {
    highlights.push(
      `${rankings[0].toolSlug}が${rankings[0].mentionCount}件のメンションで1位`
    );
  }
  if (fastestGrower && fastestGrower.growthRate > 0) {
    highlights.push(
      `${fastestGrower.toolSlug}が前週比+${(fastestGrower.growthRate * 100).toFixed(0)}%で最大の成長`
    );
  }
  const mostPositive = [...rankings].sort(
    (a, b) => b.sentimentBreakdown.positive - a.sentimentBreakdown.positive
  )[0];
  if (mostPositive) {
    highlights.push(
      `${mostPositive.toolSlug}がポジティブ率${(mostPositive.sentimentBreakdown.positive * 100).toFixed(0)}%で最も高評価`
    );
  }

  return {
    weekSlug,
    weekLabel: weekSlugToLabel(weekSlug),
    generatedAt: new Date().toISOString(),
    totalTweetsAnalyzed: totalTweets,
    rankings,
    summary,
    highlights,
  };
}
