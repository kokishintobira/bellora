import type { Metadata } from "next";
import "./globals.css";

const SITE_NAME = "Bellora";
const SITE_TAGLINE = "文系未経験からIT転職を目指すリアル体験ブログ";
const SITE_DESCRIPTION =
  "文系未経験からIT転職を目指す人のための、失敗込みのリアル体験ブログ。SES→自社サービス、資格勉強、子育てとの両立をリアルに発信。";
const SITE_URL = "https://bellora.jp";

export const metadata: Metadata = {
  title: {
    default: `${SITE_NAME} | ${SITE_TAGLINE}`,
    template: `%s | ${SITE_NAME}`,
  },
  description: SITE_DESCRIPTION,
  metadataBase: new URL(SITE_URL),
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
