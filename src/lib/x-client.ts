import type { XSearchResponse, TweetData, XTokens } from "@/types";
import { getXTokens, saveXTokens } from "@/lib/data";

/* ───── Read (Bearer Token - Pay-Per-Use) ───── */

const READ_BEARER = process.env.X_READ_BEARER_TOKEN ?? "";

export async function searchTweets(
  query: string,
  maxResults = 100
): Promise<TweetData[]> {
  if (!READ_BEARER) throw new Error("X_READ_BEARER_TOKEN not set");

  const params = new URLSearchParams({
    query: `${query} -is:retweet lang:ja`,
    max_results: String(Math.min(maxResults, 100)),
    "tweet.fields": "created_at,public_metrics,author_id",
    "user.fields": "name,username",
    expansions: "author_id",
  });

  const res = await fetch(
    `https://api.x.com/2/tweets/search/recent?${params}`,
    {
      headers: { Authorization: `Bearer ${READ_BEARER}` },
      cache: "no-store",
    }
  );

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`X API search error ${res.status}: ${body}`);
  }

  const json = (await res.json()) as XSearchResponse;
  if (!json.data) return [];

  const userMap = new Map(
    (json.includes?.users ?? []).map((u) => [u.id, u])
  );

  return json.data.map((tweet) => {
    const author = userMap.get(tweet.author_id);
    return {
      id: tweet.id,
      text: tweet.text,
      authorUsername: author?.username ?? "unknown",
      authorName: author?.name ?? "Unknown",
      likeCount: tweet.public_metrics.like_count,
      retweetCount: tweet.public_metrics.retweet_count,
      createdAt: tweet.created_at,
    };
  });
}

/* ───── Write (OAuth 2.0 PKCE - Free Tier) ───── */

const POST_CLIENT_ID = process.env.X_POST_CLIENT_ID ?? "";
const POST_CLIENT_SECRET = process.env.X_POST_CLIENT_SECRET ?? "";

/**
 * Load tokens from file, falling back to env vars for backward compatibility.
 */
async function loadTokens(): Promise<XTokens | undefined> {
  const fileTokens = await getXTokens();
  if (fileTokens) return fileTokens;

  // Env fallback (legacy)
  const accessToken = process.env.X_POST_ACCESS_TOKEN ?? "";
  const refreshToken = process.env.X_POST_REFRESH_TOKEN ?? "";
  if (accessToken) {
    return { accessToken, refreshToken, expiresAt: 0 };
  }
  return undefined;
}

/**
 * Refresh the OAuth 2.0 user access token using the refresh token.
 * Persists both new access and refresh tokens to file.
 */
async function refreshAccessToken(refreshToken: string): Promise<XTokens> {
  if (!POST_CLIENT_ID || !refreshToken) {
    throw new Error("X_POST_CLIENT_ID and refresh token required for token refresh");
  }

  const res = await fetch("https://api.x.com/2/oauth2/token", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${Buffer.from(`${POST_CLIENT_ID}:${POST_CLIENT_SECRET}`).toString("base64")}`,
    },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`Token refresh failed ${res.status}: ${body}`);
  }

  const json = await res.json();
  const tokens: XTokens = {
    accessToken: json.access_token,
    refreshToken: json.refresh_token ?? refreshToken,
    expiresAt: Date.now() + json.expires_in * 1000,
  };

  await saveXTokens(tokens);
  console.log("[x-client] Tokens refreshed and saved to x-tokens.json");
  return tokens;
}

export async function postTweet(text: string): Promise<{ id: string }> {
  let tokens = await loadTokens();
  if (!tokens?.accessToken) {
    throw new Error("No X access token available. Run /api/auth/x to authorize.");
  }

  // Proactively refresh if expired (with 60s buffer)
  if (tokens.expiresAt > 0 && Date.now() > tokens.expiresAt - 60_000 && tokens.refreshToken) {
    tokens = await refreshAccessToken(tokens.refreshToken);
  }

  const url = "https://api.x.com/2/tweets";

  let res = await fetch(url, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${tokens.accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ text }),
  });

  // If 401, try refreshing the token once
  if (res.status === 401 && tokens.refreshToken) {
    tokens = await refreshAccessToken(tokens.refreshToken);
    res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${tokens.accessToken}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ text }),
    });
  }

  if (!res.ok) {
    const body = await res.text();
    throw new Error(`X API post error ${res.status}: ${body}`);
  }

  const json = await res.json();
  return { id: json.data.id };
}
