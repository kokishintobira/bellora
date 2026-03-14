import type { Metadata } from "next";
import Link from "next/link";
import { JsonLd } from "@/components/common/JsonLd";

export const metadata: Metadata = {
  title: "Command Dojo — tmux/Neovim コマンド想起練習ツール | Bellora",
  description:
    "tmuxとNeovimのキーバインドをゲーム形式で反復練習できる無料Webアプリ。Ctrl+Bなどの実キー入力、ターミナルプレビュー、レベル制で段階的に習得。ブラウザだけで今すぐ始められます。",
  alternates: { canonical: "https://bellora.jp" },
  openGraph: {
    title: "Command Dojo — tmux/Neovim コマンド練習",
    description:
      "tmuxのペイン分割やNeovimのモード切替を、実際のキー入力で練習。無料・登録不要。",
    url: "https://bellora.jp",
    type: "website",
  },
};

const DOJO_TOOLS = [
  {
    slug: "tmux",
    title: "tmux",
    description:
      "セッション管理、ペイン分割、ウィンドウ操作など、tmux の基本〜上級コマンドを反復練習。",
    levels: ["Lv.1 セッション管理", "Lv.2 ペイン・ウィンドウ", "Lv.3 コピー・高度な操作"],
  },
  {
    slug: "nvim",
    title: "Neovim",
    description:
      "モード切替、移動、編集、検索置換、マクロまで。Neovim のキーバインドを実戦形式で習得。",
    levels: ["Lv.1 モード切替・ファイル操作", "Lv.2 編集・移動", "Lv.3 ビジュアル・マクロ"],
  },
] as const;

/* ── JSON-LD: WebApplication ── */
const webAppJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  name: "Command Dojo",
  url: "https://bellora.jp/dojo",
  description:
    "tmuxとNeovimのコマンドをゲーム形式で反復練習できる無料Webアプリ。実際のキー入力とターミナルプレビューでコマンドを体で覚える。",
  applicationCategory: "EducationalApplication",
  operatingSystem: "Web Browser",
  offers: {
    "@type": "Offer",
    price: "0",
    priceCurrency: "JPY",
  },
  inLanguage: "ja",
  creator: {
    "@type": "Organization",
    name: "Bellora",
    url: "https://bellora.jp",
  },
};

/* ── JSON-LD: FAQ (AISEO) ── */
const faqJsonLd = {
  "@context": "https://schema.org",
  "@type": "FAQPage",
  mainEntity: [
    {
      "@type": "Question",
      name: "Command Dojoとは何ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "Command Dojoは、tmuxとNeovimのコマンドをブラウザ上でゲーム形式で反復練習できる無料Webアプリです。Ctrl+Bなどのキーコンボを実際にキーボードで入力し、ターミナルプレビューで操作結果を確認しながら学べます。",
      },
    },
    {
      "@type": "Question",
      name: "tmuxのコマンドを効率的に覚える方法は？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "想起練習（アクティブリコール）が効果的です。Command Dojoでは、tmuxのセッション管理（tmux new, tmux a）、ペイン分割（Ctrl-b %、Ctrl-b \"）、ウィンドウ操作（Ctrl-b c、Ctrl-b n）を実際にキーボードで入力して練習できます。レベル1の基本操作から始めて、正答率70%以上で次のレベルに進めます。",
      },
    },
    {
      "@type": "Question",
      name: "Neovim（nvim）の基本操作を練習できますか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "はい。Neovimのモード切替（i, Esc）、ファイル操作（:w, :wq, :q!）、テキスト編集（dd, yy, u）、移動（gg, /）、ビジュアルモード（Ctrl-v）、マクロ（qa）など、基本から上級まで3段階のレベルで練習できます。",
      },
    },
    {
      "@type": "Question",
      name: "料金はかかりますか？登録は必要ですか？",
      acceptedAnswer: {
        "@type": "Answer",
        text: "完全無料で、ユーザー登録も不要です。ブラウザからアクセスするだけで、すぐに練習を始められます。学習の進捗はブラウザのローカルストレージに自動保存されます。",
      },
    },
  ],
};

export default function Home() {
  return (
    <div className="min-h-screen">
      <JsonLd data={webAppJsonLd} />
      <JsonLd data={faqJsonLd} />

      {/* ───── Header ───── */}
      <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-3">
          <Link href="/" className="text-lg font-bold tracking-tight">
            Bellora
          </Link>
          <Link
            href="/dojo"
            className="rounded-lg bg-primary px-4 py-1.5 text-sm font-medium text-white transition hover:bg-primary-dark"
          >
            Command Dojo
          </Link>
        </div>
      </header>

      {/* ───── Hero ───── */}
      <section className="px-4 pb-12 pt-20 text-center sm:pt-28">
        <p className="mx-auto mb-4 inline-block rounded-full border border-border bg-surface px-4 py-1 text-sm text-foreground-muted">
          ターミナル操作を体で覚える
        </p>
        <h1 className="mx-auto max-w-2xl text-3xl font-bold leading-snug tracking-tight sm:text-5xl sm:leading-tight">
          <span className="text-primary">Command Dojo</span>
          <br />
          <span className="text-xl sm:text-2xl font-normal text-foreground-muted">
            tmux / Neovim コマンド想起練習
          </span>
        </h1>
        <p className="mx-auto mt-6 max-w-xl text-base leading-relaxed text-foreground-muted sm:text-lg">
          tmux と Neovim のコマンドを、ゲーム形式で反復練習。
          <br className="hidden sm:block" />
          キーボードを打って覚える、無料の想起練習ツールです。
        </p>
        <div className="mt-8">
          <Link
            href="/dojo"
            className="inline-block rounded-lg bg-primary px-8 py-3 font-medium text-white transition hover:bg-primary-dark"
          >
            練習をはじめる
          </Link>
        </div>
      </section>

      {/* ───── Tool Cards ───── */}
      <section className="px-4 pb-16">
        <h2 className="text-center text-2xl font-bold mb-8">対応ツール</h2>
        <div className="mx-auto max-w-3xl grid gap-6 sm:grid-cols-2">
          {DOJO_TOOLS.map((tool) => (
            <Link
              key={tool.slug}
              href={`/dojo?tool=${tool.slug}`}
              className="rounded-xl border border-border bg-surface p-6 transition hover:border-primary/50 hover:shadow-sm"
            >
              <div className="flex items-center gap-3">
                <span className="text-2xl">{tool.slug === "tmux" ? "🖥" : "📝"}</span>
                <h3 className="text-xl font-bold">{tool.title}</h3>
              </div>
              <p className="mt-3 text-sm leading-relaxed text-foreground-muted">
                {tool.description}
              </p>
              <ul className="mt-4 space-y-1">
                {tool.levels.map((level) => (
                  <li
                    key={level}
                    className="text-xs text-foreground-muted flex items-center gap-2"
                  >
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 shrink-0" />
                    {level}
                  </li>
                ))}
              </ul>
            </Link>
          ))}
        </div>
      </section>

      {/* ───── Features ───── */}
      <section className="bg-section-alt px-4 py-16">
        <div className="mx-auto max-w-3xl">
          <h2 className="text-center text-2xl font-bold">特徴</h2>
          <div className="mt-8 grid gap-6 sm:grid-cols-3">
            {[
              {
                icon: "⌨",
                title: "実キー入力",
                desc: "Ctrl+B → D などのキーコンボを実際にキーボードで入力。テキスト入力ではなく体で覚える。",
              },
              {
                icon: "🖥",
                title: "ターミナルプレビュー",
                desc: "正解するとペイン分割やモード切替が画面上で再現。コマンドの効果を視覚的に理解。",
              },
              {
                icon: "📊",
                title: "レベル制 & 統計",
                desc: "3段階のレベルで段階的に学習。正答率70%で次のレベルがアンロック。",
              },
            ].map((f) => (
              <div key={f.title} className="text-center">
                <span className="text-3xl">{f.icon}</span>
                <h3 className="mt-2 font-bold">{f.title}</h3>
                <p className="mt-2 text-sm text-foreground-muted leading-relaxed">
                  {f.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───── AISEO: 自然言語セクション ───── */}
      <section className="px-4 py-16">
        <div className="mx-auto max-w-3xl space-y-10">
          <div>
            <h2 className="text-2xl font-bold">Command Dojo とは</h2>
            <p className="mt-4 text-foreground-muted leading-relaxed">
              Command Dojo は、ターミナルマルチプレクサ「tmux」とテキストエディタ「Neovim（nvim）」のキーバインドを、ブラウザ上で実際にキーボード入力しながら覚えられる無料の練習ツールです。想起練習（アクティブリコール）の手法を取り入れ、問題に対してコマンドを思い出して入力することで、効率的な記憶定着を実現します。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold">tmux の練習内容</h2>
            <p className="mt-3 text-foreground-muted leading-relaxed">
              tmux の Lv.1 ではセッションの作成（tmux / tmux new -s）、デタッチ（Ctrl-b d）、アタッチ（tmux a）など基本操作を学びます。Lv.2 ではペイン分割（Ctrl-b % で左右、Ctrl-b &quot; で上下）、ウィンドウの作成・切替（Ctrl-b c / n）を練習。Lv.3 ではコピーモード（Ctrl-b [）やペインのブレイク（Ctrl-b !）などの上級操作に挑戦できます。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold">Neovim の練習内容</h2>
            <p className="mt-3 text-foreground-muted leading-relaxed">
              Neovim の Lv.1 ではモード切替（i でインサート、Esc でノーマル）やファイル操作（:w 保存、:wq 保存終了、:q! 強制終了）を習得。Lv.2 では行操作（dd 削除、yy コピー、u アンドゥ）や検索（/）を練習します。Lv.3 ではビジュアルブロック選択（Ctrl-v）、一括置換（:%s/old/new/g）、マクロ記録（qa）といった上級テクニックまでカバーしています。
            </p>
          </div>

          <div>
            <h2 className="text-xl font-bold">こんな人におすすめ</h2>
            <ul className="mt-3 space-y-2 text-foreground-muted">
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">-</span>
                <span>tmux や Neovim を使い始めたが、コマンドをなかなか覚えられない方</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">-</span>
                <span>チートシートを見ながら作業しているが、手が覚えるレベルにしたい方</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">-</span>
                <span>IDE からターミナル中心のワークフローに移行したい開発者</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary mt-0.5">-</span>
                <span>通勤時間やスキマ時間にサクッとコマンドを復習したい方</span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* ───── Footer ───── */}
      <footer className="border-t border-border bg-surface px-4 py-10">
        <div className="mx-auto max-w-5xl text-center">
          <p className="font-bold">Bellora</p>
          <p className="mt-1 text-sm text-foreground-muted">
            tmux/Neovim コマンド練習ツール
          </p>
          <div className="mt-4 flex justify-center gap-6 text-sm text-foreground-muted">
            <Link href="/dojo" className="transition hover:text-foreground">
              Command Dojo
            </Link>
          </div>
          <p className="mt-6 text-xs text-foreground-muted">
            &copy; {new Date().getFullYear()} Bellora. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}
