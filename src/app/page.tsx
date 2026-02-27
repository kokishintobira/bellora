import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Bellora | 文系未経験からIT転職を目指すリアル体験ブログ",
  description:
    "文系未経験→SES→自社サービス。転職失敗も経験済み。子育てしながら資格勉強も進行中。失敗込みのリアル体験をすべて公開。",
};

/* ─── data ─── */

const NAV_LINKS = [
  { label: "はじめに", href: "#start" },
  { label: "カテゴリ", href: "#categories" },
  { label: "ツール", href: "#tools" },
  { label: "About", href: "#about" },
] as const;

const START_CARDS = [
  {
    emoji: "🗺️",
    title: "未経験→IT転職ロードマップ",
    description: "文系未経験から内定を取るまでの全ステップをまとめました。",
    href: "/posts/roadmap",
  },
  {
    emoji: "🏢",
    title: "SESのリアル",
    description: "SES企業で働いて分かった、良い面・悪い面を正直に書きます。",
    href: "/posts/ses-reality",
  },
  {
    emoji: "💡",
    title: "転職失敗から学んだこと",
    description: "失敗経験があるからこそ伝えられる、避けるべきポイント。",
    href: "/posts/failure-lessons",
  },
] as const;

const CATEGORIES = [
  {
    emoji: "📝",
    title: "転職ノウハウ",
    description: "職務経歴書・面接対策・求人の選び方",
    href: "/posts?cat=job-change",
  },
  {
    emoji: "💻",
    title: "プログラミング学習",
    description: "未経験から始めるプログラミング勉強法",
    href: "/posts?cat=programming",
  },
  {
    emoji: "📖",
    title: "資格勉強",
    description: "基本情報技術者試験を子育てしながら攻略",
    href: "/posts?cat=certification",
  },
  {
    emoji: "🏠",
    title: "働き方・SES体験",
    description: "SES / 自社開発 / リモートワークのリアル",
    href: "/posts?cat=workstyle",
  },
  {
    emoji: "👶",
    title: "子育て×キャリア",
    description: "育児と勉強・転職活動を両立するコツ",
    href: "/posts?cat=parenting",
  },
] as const;

const TOOLS = [
  {
    emoji: "🎓",
    title: "プログラミングスクール比較",
    description: "未経験向けスクールを受講者目線で比較しました。",
    href: "/posts/programming-schools",
  },
  {
    emoji: "📄",
    title: "転職エージェント比較",
    description: "IT未経験OKのエージェントを実体験ベースで紹介。",
    href: "/posts/agents-comparison",
  },
  {
    emoji: "📚",
    title: "おすすめ学習教材",
    description: "独学で使って良かった本・サービスをまとめました。",
    href: "/posts/learning-resources",
  },
] as const;

/* ─── components ─── */

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Bellora
          </Link>
          <nav className="hidden gap-6 text-sm sm:flex">
            {NAV_LINKS.map((l) => (
              <a
                key={l.href}
                href={l.href}
                className="text-foreground-muted transition hover:text-foreground"
              >
                {l.label}
              </a>
            ))}
          </nav>
          {/* Mobile menu button */}
          <a
            href="#start"
            className="rounded-lg bg-primary px-3 py-1.5 text-sm font-medium text-white transition hover:bg-primary-dark sm:hidden"
          >
            はじめに
          </a>
        </div>
      </header>

      {/* ───── Hero ───── */}
      <section className="px-4 pb-16 pt-20 text-center sm:pt-28">
        <p className="mx-auto mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1 text-sm text-foreground-muted">
          文系未経験 → SES → 自社サービス
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-tight">
          失敗込みのリアル体験を、
          <br />
          <span className="text-primary">全部書きます。</span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
          文系未経験からIT転職を目指す人のためのブログです。
          <br className="hidden sm:block" />
          転職失敗も、SESの現実も、子育てしながらの資格勉強も。
          <br className="hidden sm:block" />
          きれいごとじゃない「リアル」を発信しています。
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row sm:gap-4">
          <Link
            href="/posts"
            className="w-full rounded-lg bg-primary px-6 py-3 text-center font-medium text-white transition hover:bg-primary-dark sm:w-auto"
          >
            記事一覧を見る
          </Link>
          <a
            href="#start"
            className="w-full rounded-lg border border-border bg-surface px-6 py-3 text-center font-medium transition hover:border-primary/50 sm:w-auto"
          >
            はじめての方へ
          </a>
        </div>
      </section>

      {/* ───── Start Here ───── */}
      <section id="start" className="bg-section-alt px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            まずはここから読んでください
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-foreground-muted">
            IT転職を考えはじめたら、この3つの記事からどうぞ。
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {START_CARDS.map((card) => (
              <Link
                key={card.href}
                href={card.href}
                className="rounded-xl border border-border bg-surface p-6 transition hover:border-primary/50 hover:shadow-sm"
              >
                <span className="text-3xl">{card.emoji}</span>
                <h3 className="mt-3 font-bold">{card.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {card.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Categories ───── */}
      <section id="categories" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            カテゴリから探す
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-foreground-muted">
            気になるテーマから記事を探せます。
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {CATEGORIES.map((cat) => (
              <Link
                key={cat.title}
                href={cat.href}
                className="flex items-start gap-4 rounded-xl border border-border bg-surface p-5 transition hover:border-primary/50"
              >
                <span className="shrink-0 text-2xl">{cat.emoji}</span>
                <div>
                  <h3 className="font-bold">{cat.title}</h3>
                  <p className="mt-1 text-sm text-foreground-muted">
                    {cat.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── Tools / Comparison ───── */}
      <section id="tools" className="bg-section-alt px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-5xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            IT転職に役立つツール・サービス
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-center text-foreground-muted">
            実際に使ったサービスを正直レビューしています。
          </p>
          <div className="mt-10 grid gap-6 sm:grid-cols-3">
            {TOOLS.map((tool) => (
              <Link
                key={tool.title}
                href={tool.href}
                className="rounded-xl border border-border bg-surface p-6 transition hover:border-primary/50 hover:shadow-sm"
              >
                <span className="text-3xl">{tool.emoji}</span>
                <h3 className="mt-3 font-bold">{tool.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-foreground-muted">
                  {tool.description}
                </p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ───── About ───── */}
      <section id="about" className="px-4 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold sm:text-3xl">
            このブログについて
          </h2>

          {/* Profile */}
          <div className="mt-10 rounded-xl border border-border bg-surface p-6 sm:p-8">
            <div className="flex items-center gap-4">
              <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full bg-primary/10 text-2xl">
                ✍️
              </div>
              <div>
                <p className="font-bold">Bellora 管理人</p>
                <p className="mt-0.5 text-sm text-foreground-muted">
                  文系未経験 → SES → 自社サービスエンジニア
                </p>
              </div>
            </div>
            <p className="mt-4 text-sm leading-relaxed text-foreground-muted">
              新卒で非IT企業に就職後、独学でプログラミングを学びIT業界に転職。SES企業で経験を積み、現在は自社サービス企業でエンジニアとして働いています。転職では失敗も経験しました。子育てしながら基本情報技術者試験の勉強も進行中。同じように「未経験だけどIT転職したい」と思っている方に向けて、リアルな情報を発信しています。
            </p>
          </div>

          {/* Disclaimer & PR */}
          <div className="mt-6 space-y-4 text-xs leading-relaxed text-foreground-muted">
            <p>
              <span className="font-bold text-foreground">免責事項:</span>{" "}
              当サイトの情報は筆者個人の経験・調査に基づくものであり、正確性・最新性を保証するものではありません。転職やサービス利用に関する最終判断はご自身の責任でお願いいたします。
            </p>
            <p>
              <span className="font-bold text-foreground">PR表記:</span>{" "}
              当サイトの一部記事にはアフィリエイト広告が含まれます。紹介するサービスは筆者が実際に利用・調査したものに限定しており、広告の有無が評価に影響することはありません。
            </p>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-border bg-surface px-4 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-bold">Bellora</p>
          <p className="mt-1 text-sm text-foreground-muted">
            文系未経験からIT転職を目指すリアル体験ブログ
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-foreground-muted">
            <Link href="/posts" className="transition hover:text-foreground">
              記事一覧
            </Link>
            <a href="#about" className="transition hover:text-foreground">
              About
            </a>
          </div>
          <p className="mt-6 text-xs text-foreground-muted">
            &copy; {new Date().getFullYear()} Bellora. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
