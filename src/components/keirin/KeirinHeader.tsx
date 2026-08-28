"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FlaskIcon, HistoryIcon, HomeIcon, SettingsIcon, SparkIcon } from "./Icons";

const nav = [
  { href: "/keirin", label: "ホーム", icon: HomeIcon, exact: true },
  { href: "/keirin/today", label: "今日の予想", mobile: "今日", icon: SparkIcon },
  { href: "/keirin/history", label: "履歴", icon: HistoryIcon },
  { href: "/keirin/experiments", label: "実験", icon: FlaskIcon },
  { href: "/keirin/settings", label: "設定", icon: SettingsIcon, desktopOnly: true },
];

export function KeirinHeader() {
  const pathname = usePathname();
  const isActive = (href: string, exact?: boolean) => exact ? pathname === href : pathname.startsWith(href);

  return (
    <>
      <header className="k-header">
        <div className="k-header-inner">
          <Link href="/keirin" className="k-brand" aria-label="KEIRIN LAB ホーム">
            <span className="k-brand-mark"><span /></span>
            <span><strong>KEIRIN LAB</strong><small>AI SIMULATION</small></span>
          </Link>
          <nav className="k-desktop-nav" aria-label="メインナビゲーション">
            {nav.map(({ href, label, exact }) => (
              <Link key={href} href={href} className={isActive(href, exact) ? "is-active" : ""}>{label}</Link>
            ))}
          </nav>
          <div className="k-system-status"><span />データ更新済み <b>08:05</b></div>
        </div>
      </header>
      <nav className="k-bottom-nav" aria-label="モバイルナビゲーション">
        {nav.filter((item) => !item.desktopOnly).map(({ href, label, mobile, icon: Icon, exact }) => (
          <Link key={href} href={href} className={isActive(href, exact) ? "is-active" : ""}>
            <Icon /><span>{mobile ?? label}</span>
          </Link>
        ))}
      </nav>
    </>
  );
}
