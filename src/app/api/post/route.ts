import { NextRequest, NextResponse } from "next/server";
import { getWeeklyReport, getTools } from "@/lib/data";
import { postTweet } from "@/lib/x-client";
import type { PostRequest, ApiResponse } from "@/types";

function buildPostText(
  weekLabel: string,
  rankings: { toolSlug: string; mentionCount: number; growthRate: number }[],
  toolNames: Map<string, string>
): string {
  const top5 = rankings.slice(0, 5);
  const lines = top5.map((r, i) => {
    const name = toolNames.get(r.toolSlug) ?? r.toolSlug;
    const growth =
      r.growthRate >= 0
        ? `+${(r.growthRate * 100).toFixed(0)}%`
        : `${(r.growthRate * 100).toFixed(0)}%`;
    return `${i + 1}. ${name} (${growth})`;
  });

  return [
    `${weekLabel} AIツールトレンド TOP5`,
    "",
    ...lines,
    "",
    "詳細レポートはプロフィールのリンクから",
    "#AIツール #トレンド分析",
  ].join("\n");
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  const authHeader = req.headers.get("authorization");
  const secret = process.env.API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json()) as PostRequest;
    const { weekSlug, dryRun = false } = body;

    if (!weekSlug) {
      return NextResponse.json(
        { success: false, message: "weekSlug is required" },
        { status: 400 }
      );
    }

    const report = await getWeeklyReport(weekSlug);
    if (!report) {
      return NextResponse.json(
        { success: false, message: `Report not found: ${weekSlug}` },
        { status: 404 }
      );
    }

    const tools = await getTools();
    const toolNames = new Map(tools.map((t) => [t.slug, t.name]));

    const text = buildPostText(report.weekLabel, report.rankings, toolNames);

    if (dryRun) {
      return NextResponse.json({
        success: true,
        message: "Dry run - tweet not posted",
        data: { text },
      });
    }

    const result = await postTweet(text);

    return NextResponse.json({
      success: true,
      message: "Tweet posted",
      data: { tweetId: result.id, text },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
