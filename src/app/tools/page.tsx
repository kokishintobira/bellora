import type { Metadata } from "next";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToolCard } from "@/components/tool/ToolCard";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { getTools } from "@/lib/data";
import { ALL_CATEGORIES } from "@/lib/constants";

export const revalidate = 86400;

export const metadata: Metadata = {
  title: "AIツール一覧",
  description:
    "Xトレンド分析で追跡中のAIツール一覧。チャットボット、画像生成、コーディング、動画、音声など各カテゴリのAIツールを網羅。",
};

export default async function ToolsPage() {
  const tools = await getTools();

  return (
    <div className="min-h-screen">
      <Header />
      <main className="mx-auto max-w-5xl px-5 py-12">
        <h1 className="text-2xl font-bold">AIツール一覧</h1>
        <p className="mt-2 text-sm text-foreground-muted">
          Xトレンド分析で追跡中のAIツール。各ツールの詳細とトレンド履歴を確認できます。
        </p>

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryBadge key={cat} category={cat} />
          ))}
        </div>

        {/* Tools grid */}
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {tools.map((tool) => (
            <ToolCard key={tool.slug} tool={tool} />
          ))}
        </div>
      </main>
      <Footer />
    </div>
  );
}
