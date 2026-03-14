import Link from "next/link";
import { SITE_NAME, CONTACT_EMAIL } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-border bg-muted px-5 py-12">
      <div className="mx-auto max-w-5xl text-center">
        <p className="text-lg font-bold text-foreground">{SITE_NAME}</p>
        <p className="mt-1 text-xs text-foreground-muted">
          AIツール Xトレンド分析メディア
        </p>

        <nav className="mt-6 flex flex-wrap justify-center gap-6 text-xs text-foreground-muted">
          <Link href="/reports" className="hover:text-foreground">
            レポート
          </Link>
          <Link href="/tools" className="hover:text-foreground">
            AIツール一覧
          </Link>
        </nav>

        <div className="mt-8 space-y-2 text-xs leading-relaxed text-foreground-muted/60">
          <p>
            当サイトはアフィリエイトプログラムに参加しています。
            掲載リンクを通じてサービスに登録された場合、当サイトが報酬を受け取ることがあります。
          </p>
          <p>
            データはX（旧Twitter）上の公開ポストを分析したものであり、
            各ツールの品質・性能を保証するものではありません。
          </p>
        </div>

        <div className="mt-6 text-xs text-foreground-muted/40">
          <p>
            お問い合わせ：
            <a
              href={`mailto:${CONTACT_EMAIL}`}
              className="underline hover:text-primary"
            >
              {CONTACT_EMAIL}
            </a>
          </p>
          <p className="mt-2">
            &copy; {new Date().getFullYear()} {SITE_NAME}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
