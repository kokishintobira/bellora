import type { Metadata } from "next";
import { AdBanner } from "@/components/dojo/AdBanner";
import { JsonLd } from "@/components/common/JsonLd";
import { AD_CODES } from "@/lib/dojo/constants";
import "./dojo.css";

export const metadata: Metadata = {
  title: "Command Dojo — tmux/Neovim コマンド想起練習ツール",
  description:
    "tmuxとNeovimのキーバインドを実際のキーボード入力で反復練習。Ctrl-b %でペイン分割、iでインサートモードなど、ターミナルプレビュー付きで視覚的に学べる無料Webアプリ。",
  keywords: [
    "tmux 練習", "neovim 練習", "tmux コマンド一覧", "nvim キーバインド",
    "tmux チートシート", "vim 練習", "ターミナル 練習", "tmux ペイン分割",
    "neovim モード切替", "command dojo",
  ],
  alternates: { canonical: "https://bellora.jp/dojo" },
  openGraph: {
    title: "Command Dojo — tmux/Neovim コマンド練習",
    description: "tmuxのペイン分割やNeovimのモード切替を実キー入力で練習。無料・登録不要。",
    url: "https://bellora.jp/dojo",
  },
  robots: { index: true, follow: true },
};

const breadcrumbJsonLd = {
  "@context": "https://schema.org",
  "@type": "BreadcrumbList",
  itemListElement: [
    { "@type": "ListItem", position: 1, name: "Bellora", item: "https://bellora.jp" },
    { "@type": "ListItem", position: 2, name: "Command Dojo", item: "https://bellora.jp/dojo" },
  ],
};

export default function DojoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="dojo-theme">
      <JsonLd data={breadcrumbJsonLd} />
      <div className="scanlines" aria-hidden="true" />
      <header className="border-b border-[var(--color-border)] px-4 py-3">
        <div className="mx-auto flex max-w-6xl items-center justify-between">
          <a href="/dojo" className="flex items-center gap-2 no-underline">
            <span className="text-[var(--color-primary)] text-lg font-bold">
              ⌨ Command Dojo
            </span>
          </a>
          <span className="text-xs text-[var(--color-foreground-muted)]">
            tmux / nvim 想起練習
          </span>
        </div>
      </header>

      {/* 3-column: left ad | content | right ad */}
      <div className="mx-auto max-w-6xl px-4 py-6 flex gap-6 justify-center">
        {/* Left sidebar ads — PC only */}
        <aside className="hidden xl:flex shrink-0 sticky top-6 self-start flex-col gap-4">
          <AdBanner slot={AD_CODES[0]} format="vertical" />
          <AdBanner slot={AD_CODES[1]} format="vertical" />
        </aside>

        {/* Main content */}
        <main className="w-full max-w-3xl min-w-0">{children}</main>

        {/* Right sidebar ads — PC only */}
        <aside className="hidden xl:flex shrink-0 sticky top-6 self-start flex-col gap-4">
          <AdBanner slot={AD_CODES[2]} format="vertical" />
          <AdBanner slot={AD_CODES[3]} format="vertical" />
        </aside>
      </div>

      <footer className="border-t border-[var(--color-border)] px-4 py-4 text-center text-xs text-[var(--color-foreground-muted)]">
        <a
          href="/"
          className="text-[var(--color-foreground-muted)] hover:text-[var(--color-primary)] no-underline"
        >
          ← Bellora トップへ
        </a>
      </footer>
    </div>
  );
}
