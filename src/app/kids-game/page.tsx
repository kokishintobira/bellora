import type { Metadata } from "next";
import { KidsGame } from "./KidsGame";

export const metadata: Metadata = {
  title: "みつけてタップ！ 4歳からのさがしゲーム",
  description:
    "ひらがな・アルファベット・数字をタップして探す、4歳から遊べるブラウザゲーム。登録不要でそのまま遊べます。",
  alternates: { canonical: "https://bellora.jp/kids-game" },
  openGraph: {
    title: "みつけてタップ！ 4歳からのさがしゲーム",
    description: "ことば探しと1から10の数字探しを、タップの波紋付きで楽しく練習できます。",
    url: "https://bellora.jp/kids-game",
  },
};

export default function KidsGamePage() {
  return <KidsGame />;
}
