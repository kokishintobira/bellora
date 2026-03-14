import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ToolCard } from "@/components/tool/ToolCard";
import { CategoryBadge } from "@/components/common/CategoryBadge";
import { getToolsByCategory } from "@/lib/data";
import type { ToolCategory } from "@/types";
import {
  ALL_CATEGORIES,
  CATEGORY_LABELS,
  CATEGORY_EMOJI,
} from "@/lib/constants";

export const revalidate = 86400;

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return ALL_CATEGORIES.map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const label = CATEGORY_LABELS[slug as ToolCategory];
  if (!label) return {};
  return {
    title: `${label} AIツール一覧`,
    description: `${label}カテゴリのAIツールをXトレンドデータとともに紹介。`,
  };
}

export default async function CategoryPage({ params }: Props) {
  const { slug } = await params;
  const category = slug as ToolCategory;

  if (!ALL_CATEGORIES.includes(category)) notFound();

  const tools = await getToolsByCategory(category);
  const label = CATEGORY_LABELS[category];
  const emoji = CATEGORY_EMOJI[category];

  return (
    <div className="min-h-screen">
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
          <span className="text-foreground">{label}</span>
        </nav>

        <h1 className="text-2xl font-bold">
          {emoji} {label} AIツール
        </h1>
        <p className="mt-2 text-sm text-foreground-muted">
          {label}カテゴリのAIツール一覧。Xトレンドデータとともに最新動向をチェック。
        </p>

        {/* Category filter */}
        <div className="mt-6 flex flex-wrap gap-2">
          {ALL_CATEGORIES.map((cat) => (
            <CategoryBadge key={cat} category={cat} />
          ))}
        </div>

        {tools.length > 0 ? (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {tools.map((tool) => (
              <ToolCard key={tool.slug} tool={tool} />
            ))}
          </div>
        ) : (
          <p className="mt-12 text-center text-foreground-muted">
            このカテゴリにはまだツールが登録されていません。
          </p>
        )}
      </main>
      <Footer />
    </div>
  );
}
