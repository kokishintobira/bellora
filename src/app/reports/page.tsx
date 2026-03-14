import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { WeeklyReportCard } from "@/components/report/WeeklyReportCard";
import { getAllReportSlugs, getWeeklyReport } from "@/lib/data";
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "週次レポート アーカイブ",
  description:
    "AIツールのXトレンド分析レポートのアーカイブ。毎週のランキングと分析結果をまとめています。",
};

export default async function ReportsPage() {
  const slugs = await getAllReportSlugs();
  const reports = (
    await Promise.all(slugs.map((s) => getWeeklyReport(s)))
  ).filter(Boolean);

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-2xl font-bold">週次レポート アーカイブ</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          AIツールのXトレンド分析レポートを週ごとにまとめています。
        </p>

        {reports.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2">
            {reports.map((report) => (
              <WeeklyReportCard key={report!.weekSlug} report={report!} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-foreground-muted">
            レポートはまだありません。
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
