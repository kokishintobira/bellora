/* ───── Category ───── */

export type ToolCategory =
  | "chatbot"
  | "image-gen"
  | "coding"
  | "productivity"
  | "video"
  | "audio"
  | "writing"
  | "research"
  | "other";

/* ───── Tool ───── */

export interface Tool {
  slug: string;
  name: string;
  vendor: string;
  category: ToolCategory;
  description: string;
  url: string;
  affiliateSlug: string;
  xSearchQueries: string[];
}

/* ───── Tweet ───── */

export interface TweetData {
  id: string;
  text: string;
  authorUsername: string;
  authorName: string;
  likeCount: number;
  retweetCount: number;
  createdAt: string;
}

/* ───── Weekly Stats per Tool ───── */

export interface SentimentBreakdown {
  positive: number;
  neutral: number;
  negative: number;
}

export interface ToolWeeklyStats {
  toolSlug: string;
  mentionCount: number;
  growthRate: number;
  sentimentBreakdown: SentimentBreakdown;
  topTweets: TweetData[];
}

/* ───── Weekly Report ───── */

export interface WeeklyReport {
  weekSlug: string;
  weekLabel: string;
  generatedAt: string;
  totalTweetsAnalyzed: number;
  rankings: ToolWeeklyStats[];
  summary: string;
  highlights: string[];
}

/* ───── Tool Trend History ───── */

export interface ToolWeekEntry {
  weekSlug: string;
  mentionCount: number;
  growthRate: number;
  sentimentBreakdown: SentimentBreakdown;
}

export interface ToolTrendHistory {
  toolSlug: string;
  weeks: ToolWeekEntry[];
}

/* ───── X API Response Types ───── */

export interface XSearchResponse {
  data?: {
    id: string;
    text: string;
    author_id: string;
    created_at: string;
    public_metrics: {
      retweet_count: number;
      reply_count: number;
      like_count: number;
      quote_count: number;
    };
  }[];
  includes?: {
    users?: {
      id: string;
      name: string;
      username: string;
    }[];
  };
  meta?: {
    result_count: number;
    next_token?: string;
  };
}

/* ───── OAuth 2.0 Token Storage ───── */

export interface XTokens {
  accessToken: string;
  refreshToken: string;
  expiresAt: number; // Unix ms
}

export interface XPkceState {
  codeVerifier: string;
  state: string;
  createdAt: number; // Unix ms
}

/* ───── API Request/Response ───── */

export interface CollectRequest {
  weekSlug?: string;
}

export interface PostRequest {
  weekSlug: string;
  dryRun?: boolean;
}

export interface ApiResponse {
  success: boolean;
  message: string;
  data?: unknown;
}
