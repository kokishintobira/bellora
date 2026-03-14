import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = "Bellora";
const SITE_TAGLINE = "tmux/Neovim コマンド練習ツール Command Dojo";
const SITE_DESCRIPTION =
  "tmuxとNeovimのコマンドをゲーム形式で反復練習できる無料Webアプリ「Command Dojo」。実際にキーボードでCtrl+Bなどのキーコンボを入力し、ターミナルプレビューで操作結果を視覚的に確認。レベル制で段階的に学べます。";
const SITE_URL = "https://bellora.jp";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
  keywords: [
    "tmux", "neovim", "nvim", "vim", "コマンド練習", "キーバインド",
    "ターミナル", "CLI", "チートシート", "想起練習", "command dojo",
  ],
  openGraph: {
    type: "website",
    locale: "ja_JP",
    siteName: SITE_NAME,
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  twitter: {
    card: "summary_large_image",
    title: `${SITE_NAME} | ${SITE_TAGLINE}`,
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: SITE_URL,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ja">
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}
