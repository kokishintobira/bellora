import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { RankingTable } from "@/components/report/RankingTable";
import { MentionChart } from "@/components/report/MentionChart";
import { KeyTweetCard } from "@/components/report/KeyTweetCard";
import { DataSourceNote } from "@/components/common/DataSourceNote";
import { JsonLd } from "@/components/common/JsonLd";
import { getWeeklyReport, getTools, getAllReportSlugs } from "@/lib/data";
import { weekSlugToDateRange, formatDate } from "@/lib/format";
import { SITE_NAME, SITE_URL } from "@/lib/constants";

export const revalidate = 3600;

type Props = { params: Promise<{ weekSlug: string }> };

export async function generateStaticParams() {
  const slugs = await getAllReportSlugs();
  return slugs.map((weekSlug) => ({ weekSlug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { weekSlug } = await params;
  const report = await getWeeklyReport(weekSlug);
  if (!report) return {};
  return {
    title: `${report.weekLabel} AIツールトレンドレポート`,
    description: report.summary,
  };
}

export default async function WeeklyReportPage({ params }: Props) {
  const { weekSlug } = await params;
  const [report, tools] = await Promise.all([
    getWeeklyReport(weekSlug),
    getTools(),
  ]);

  if (!report) notFound();

  const dateRange = weekSlugToDateRange(report.weekSlug);

  const articleJsonLd = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: `${report.weekLabel} AIツールトレンドレポート`,
    description: report.summary,
    datePublished: report.generatedAt,
    publisher: {
      "@type": "Organization",
      name: SITE_NAME,
      url: SITE_URL,
    },
  };

  return (
    <div className="min-h-screen">
      <JsonLd data={articleJsonLd} />
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-12">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-foreground-muted">
          <Link href="/" className="hover:text-foreground">
            Home
          </Link>
          <span className="mx-2">/</span>
          <Link href="/reports" className="hover:text-foreground">
            レポート
          </Link>
          <span className="mx-2">/</span>
          <span className="text-foreground">{report.weekLabel}</span>
        </nav>

        <h1 className="text-2xl font-bold sm:text-3xl">
          {report.weekLabel} AIツールトレンドレポート
        </h1>
        <div className="mt-2 flex flex-wrap items-center gap-4 text-sm text-foreground-muted">
          <span>{dateRange}</span>
          <DataSourceNote tweetCount={report.totalTweetsAnalyzed} />
          <span>作成日: {formatDate(report.generatedAt)}</span>
        </div>

        {/* Summary */}
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-3 text-lg font-bold">概要</h2>
          <p className="text-sm leading-relaxed">{report.summary}</p>
          <ul className="mt-4 space-y-2">
            {report.highlights.map((h) => (
              <li
                key={h}
                className="flex items-start gap-2 text-sm text-foreground-muted"
              >
                <span className="mt-0.5 text-primary">&#9679;</span>
                {h}
              </li>
            ))}
          </ul>
        </section>

        {/* Chart */}
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold">メンション数チャート</h2>
          <MentionChart rankings={report.rankings} />
        </section>

        {/* Full Ranking Table */}
        <section className="mt-8 rounded-xl border border-border bg-surface p-6">
          <h2 className="mb-4 text-lg font-bold">ランキング</h2>
          <RankingTable rankings={report.rankings} tools={tools} />
        </section>

        {/* Key Tweets */}
        <section className="mt-8">
          <h2 className="mb-4 text-lg font-bold">注目のポスト</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {report.rankings.flatMap((stat) =>
              stat.topTweets.slice(0, 1).map((tweet) => (
                <div key={tweet.id}>
                  <p className="mb-2 text-xs font-medium text-foreground-muted">
                    {tools.find((t) => t.slug === stat.toolSlug)?.name ??
                      stat.toolSlug}
                  </p>
                  <KeyTweetCard tweet={tweet} />
                </div>
              ))
            )}
          </div>
        </section>

        {/* Back */}
        <div className="mt-12 text-center">
          <Link
            href="/reports"
            className="text-sm text-primary hover:underline"
          >
            &larr; レポート一覧に戻る
          </Link>
        </div>
      </main>
      <Footer />
    </div>
  );
}
