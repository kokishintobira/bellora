import Link from "next/link";
import { SITE_NAME, SITE_TAGLINE } from "@/lib/constants";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-5xl items-center justify-between px-5">
        <Link href="/" className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary">
            <svg
              width="18"
              height="18"
              viewBox="0 0 24 24"
              fill="none"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
              <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
            </svg>
          </div>
          <span className="text-lg font-bold tracking-wide text-foreground">
            {SITE_NAME}
          </span>
        </Link>
        <nav className="flex items-center gap-5 text-sm">
          <Link
            href="/reports"
            className="text-foreground-muted transition hover:text-foreground"
          >
            レポート
          </Link>
          <Link
            href="/tools"
            className="text-foreground-muted transition hover:text-foreground"
          >
            AIツール
          </Link>
          <span className="hidden text-xs text-foreground-muted sm:block">
            {SITE_TAGLINE}
          </span>
        </nav>
      </div>
    </header>
  );
}
