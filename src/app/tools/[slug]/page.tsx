import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToolMetaHead } from "@/components/tool/ToolMetaHead";
import { ToolHistoryChart } from "@/components/tool/ToolHistoryChart";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { AffiliateButton } from "@/components/common/AffiliateButton";
import { TrendBadge } from "@/components/report/TrendBadge";
import { SentimentIndicator } from "@/components/report/SentimentIndicator";
import { KeyTweetCard } from "@/components/report/KeyTweetCard";
import { getTools, getToolBySlug, getToolTrendHistory, getLatestReport } from "@/lib/data";
import { formatNumber } from "@/lib/format";
export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  const tools = await getTools();
  return tools.map((t) => ({ slug: t.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const tool = await getToolBySlug(slug);
  if (!tool) return {};
  return {
    title: `${tool.name} - AIツールトレンド分析`,
    description: `${tool.name}（${tool.vendor}）のXトレンド分析。メンション数推移、センチメント、注目ポストを掲載。`,
  };
}

export default async function ToolPage({ params }: Props) {
  const { slug } = await params;
  const [tool, history, report] = await Promise.all([
    getToolBySlug(slug),
    getToolTrendHistory(slug),
    getLatestReport(),
  ]);

  if (!tool) notFound();

  const latestStats = report?.rankings.find((r) => r.toolSlug === slug);

  return (
    <div className="min-h-screen">
      <ToolMetaHead tool={tool} />
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-foreground-muted">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/tools" className="hover:text-foreground">
            AIツール
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{tool.name}</span>
        </nav>

        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold sm:text-3xl">{tool.name}</h1>
            <p className="mt-1 text-sm text-foreground-muted">{tool.vendor}</p>
            <div className="mt-2">
              <CategoryBadge category={tool.category} />
            </div>
          </div>
          <AffiliateButton slug={tool.affiliateSlug} />
        </div>

        <p className="mt-6 text-sm leading-relaxed text-foreground-muted">
          {tool.description}
        </p>

        {/* Latest Stats */}
        {latestStats && (
          <section className="mt-8 grid gap-4 sm:grid-cols-3">
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs text-foreground-muted">メンション数</p>
              <p className="mt-1 text-2xl font-bold font-mono">
                {formatNumber(latestStats.mentionCount)}
              </p>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="text-xs text-foreground-muted">前週比</p>
              <div className="mt-1">
                <TrendBadge growthRate={latestStats.growthRate} />
              </div>
            </div>
            <div className="rounded-xl border border-border bg-surface p-5">
              <p className="mb-2 text-xs text-foreground-muted">
                センチメント
              </p>
              <SentimentIndicator
                sentiment={latestStats.sentimentBreakdown}
              />
            </div>
          </section>
        )}

        {/* Trend History Chart */}
        {history && history.weeks.length > 0 && (
          <section className="mt-8 rounded-xl border border-border bg-surface p-5">
            <h2 className="mb-4 text-lg font-bold">メンション数推移</h2>
            <ToolHistoryChart weeks={history.weeks} />
          </section>
        )}

        {/* Key Tweets */}
        {latestStats && latestStats.topTweets.length > 0 && (
          <section className="mt-8">
            <h2 className="mb-4 text-lg font-bold">注目のポスト</h2>
            <div className="grid gap-4 sm:grid-cols-2">
              {latestStats.topTweets.map((tweet) => (
                <KeyTweetCard key={tweet.id} tweet={tweet} />
              ))}
            </div>
          </section>
        )}

        {/* Back */}
        <div className="mt-12 text-center">
          <Link
            href="/tools"
            className="text-sm text-primary hover:underline"
          >
            &larr; AIツール一覧に戻る
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
