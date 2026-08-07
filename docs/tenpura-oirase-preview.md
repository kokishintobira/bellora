# 天ぷら奥入瀬 ホームページ デザイン案（プレビュー）

青森県十和田市「天ぷら奥入瀬」のホームページ制作にあたっての、方向性確認用のプレビュー。
bellora の `public/preview/` 配下に静的HTMLとして置いてあり、Vercel のデプロイに相乗りして公開される。

## URL（本番）

| URL | 内容 |
| --- | --- |
| `https://bellora-vert.vercel.app/preview/tenpura-oirase` | 2案の比較ページ（PC・タブレット・スマホ表示を切替） |
| `https://bellora-vert.vercel.app/preview/tenpura-oirase/a` | A案：高級・割烹スタイル |
| `https://bellora-vert.vercel.app/preview/tenpura-oirase/b` | B案：地元の定食屋スタイル |

短いURLは `next.config.ts` の `rewrites()` で実ファイルに繋いでいる。
実ファイル直指定（`/preview/tenpura-oirase/index.html` など）でも開ける。

`src/app/robots.ts` で `/preview/` をクロール禁止にし、各HTMLにも `noindex` を入れてあるので、検索結果には出ない。

## ローカルで確認する

`public/` をそのままルートにして配信すると、本番と同じパスで確認できる。

```bash
cd public
python3 -m http.server 4321
# http://localhost:4321/preview/tenpura-oirase/index.html
```

`npm run dev`（Next.js）でも同じURLで確認できる。短縮URL（`/preview/tenpura-oirase`）は Next.js 経由でのみ有効。

## 2つの案

| | A案（高級・割烹） | B案（地元の定食屋） |
| --- | --- | --- |
| 見た目 | 黒×金、縦書き、余白多め | 生成り×朱、大きな文字、価格が主役 |
| 向いている目的 | 宴会・コース・観光客の予約を増やす | 地元客・家族連れ・昼の来店を増やす |
| 写真の必要性 | 高い（料理写真の質が印象を決める） | 低め（写真が少なくても成立する） |
| 特徴 | スクロール演出、タブ式お品書き | 人気ランキング、営業時間カレンダー |

どちらもPC・タブレット・スマホ対応。スマホでは画面下に電話ボタンが固定表示される。

## 掲載内容について

- **写真はすべて差し替え前提のサンプル画像**（`public/preview/tenpura-oirase/assets/*.svg`）。口コミサイトの写真は権利の都合で使用していない。
- 住所・電話番号・営業時間・席数・駐車場は公開情報（食べログ／ぐるなび）を参照。
- **メニューと価格の一部は仮の内容**。天汁セット1,000円・とんかつ950円・ヒレかつ1,150円などは口コミに出ていた実数、それ以外は補ったもの。
- 地図はGoogleマップの埋め込み。

## 次に決めること

1. A / B どちらの方向で進めるか（両方の要素を混ぜることも可能）
2. お店に確認する項目：正確なメニューと価格、定休日の決まり方、支払い方法（カード・電子マネー）、宴会の受付条件、SNSの有無
3. 写真撮影：外観・店内・人気メニュー3品があると、どちらの案も完成度が大きく上がる
4. 公開に必要なもの：独自ドメイン、サーバー（年間費用の目安は別途）

## ファイル構成

```
public/preview/tenpura-oirase/
├── index.html            比較プレビュー（PC/タブレット/スマホ切替）
├── a-premium/index.html  A案
├── b-shokudo/index.html  B案
└── assets/               サンプル画像（SVG・差し替え前提）
```
