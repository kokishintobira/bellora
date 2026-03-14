import { NextRequest, NextResponse } from "next/server";
import { getTools, getToolBySlug, getToolTrendHistory, saveWeeklyReport, saveToolTrendHistory } from "@/lib/data";
import { searchTweets } from "@/lib/x-client";
import { analyzeToolTweets, buildWeeklyReport } from "@/lib/analyzer";
import type { TweetData, ToolWeeklyStats, ApiResponse } from "@/types";

function getCurrentWeekSlug(): string {
  const now = new Date();
  const jan4 = new Date(now.getFullYear(), 0, 4);
  const dayOfYear = Math.floor(
    (now.getTime() - new Date(now.getFullYear(), 0, 1).getTime()) / 86400000
  );
  const dayOfWeek = jan4.getDay() || 7;
  const weekNum = Math.ceil((dayOfYear + dayOfWeek) / 7);
  return `${now.getFullYear()}-W${String(weekNum).padStart(2, "0")}`;
}

interface CollectBody {
  weekSlug?: string;
  toolSlug?: string;    // 1ツールだけ収集
  maxResults?: number;  // クエリあたり取得件数（デフォルト100）
  dryRun?: boolean;     // trueならX APIを叩かず、保存もしない
}

export async function POST(req: NextRequest): Promise<NextResponse<ApiResponse>> {
  // Auth check
  const authHeader = req.headers.get("authorization");
  const secret = process.env.API_SECRET;
  if (!secret || authHeader !== `Bearer ${secret}`) {
    return NextResponse.json(
      { success: false, message: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    const body = (await req.json().catch(() => ({}))) as CollectBody;
    const weekSlug = body.weekSlug ?? getCurrentWeekSlug();
    const maxResults = Math.min(body.maxResults ?? 100, 100);
    const dryRun = body.dryRun ?? false;

    // Resolve target tools
    let tools;
    if (body.toolSlug) {
      const single = await getToolBySlug(body.toolSlug);
      if (!single) {
        return NextResponse.json(
          { success: false, message: `Tool not found: ${body.toolSlug}` },
          { status: 404 }
        );
      }
      tools = [single];
    } else {
      tools = await getTools();
    }

    // Dry run: return what would be collected without calling X API
    if (dryRun) {
      const queries = tools.flatMap((t) =>
        t.xSearchQueries.map((q) => ({ tool: t.slug, query: q }))
      );
      return NextResponse.json({
        success: true,
        message: "Dry run - no API calls made",
        data: {
          weekSlug,
          toolCount: tools.length,
          queryCount: queries.length,
          maxResultsPerQuery: maxResults,
          estimatedApiCalls: queries.length,
          queries,
        },
      });
    }

    const allStats: ToolWeeklyStats[] = [];
    let totalTweets = 0;

    for (const tool of tools) {
      let toolTweets: TweetData[] = [];

      for (const query of tool.xSearchQueries) {
        const tweets = await searchTweets(query, maxResults);
        toolTweets = toolTweets.concat(tweets);
      }

      // Deduplicate by tweet ID
      const seen = new Set<string>();
      toolTweets = toolTweets.filter((t) => {
        if (seen.has(t.id)) return false;
        seen.add(t.id);
        return true;
      });

      totalTweets += toolTweets.length;

      // Get previous mention count for growth rate calculation
      const history = await getToolTrendHistory(tool.slug);
      const prevWeek = history?.weeks[history.weeks.length - 1];

      const stats = analyzeToolTweets(
        toolTweets,
        tool.slug,
        prevWeek?.mentionCount
      );
      allStats.push(stats);

      // Update tool trend history
      const updatedHistory = history ?? { toolSlug: tool.slug, weeks: [] };
      updatedHistory.weeks.push({
        weekSlug,
        mentionCount: stats.mentionCount,
        growthRate: stats.growthRate,
        sentimentBreakdown: stats.sentimentBreakdown,
      });
      await saveToolTrendHistory(updatedHistory);
    }

    // Build and save weekly report (only if collecting all tools)
    if (!body.toolSlug) {
      const report = buildWeeklyReport(weekSlug, allStats, totalTweets);
      await saveWeeklyReport(report);
    }

    return NextResponse.json({
      success: true,
      message: `Collected for ${weekSlug}`,
      data: {
        weekSlug,
        toolsAnalyzed: tools.length,
        totalTweets,
        topTool: allStats.sort((a, b) => b.mentionCount - a.mentionCount)[0]?.toolSlug,
      },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json(
      { success: false, message },
      { status: 500 }
    );
  }
}
