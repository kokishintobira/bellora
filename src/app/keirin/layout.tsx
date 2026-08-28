import type { Metadata } from "next";
import { KeirinHeader } from "@/components/keirin/KeirinHeader";
import { KeirinProvider } from "@/components/keirin/KeirinProvider";
import "./keirin.css";

export const metadata: Metadata = {
  title: "競輪AIシミュレーション",
  description: "AI予測ルールに基づく仮想投資の投資額・回収金・収支・回収率を確認できるシミュレーションダッシュボード。",
  robots: { index: false, follow: false },
};

export default function KeirinLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="keirin-app">
      <KeirinProvider>
        <KeirinHeader />
        <main className="k-main">{children}</main>
      </KeirinProvider>
    </div>
  );
}
