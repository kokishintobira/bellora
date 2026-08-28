This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.

## 競輪AIシミュレーション V1

`/keirin` 配下に、予測ルールを仮想投資成績として確認するダッシュボードがあります。

- `/keirin` — 今月のKPI、収支推移、前日結果、日次履歴
- `/keirin/today` — 今日の予想、買い目、オッズ、想定払戻、分析メモ
- `/keirin/history` — 全期間KPI、日次・レース別結果
- `/keirin/experiments` — モデル実験履歴、バックテスト条件
- `/keirin/settings` — 基準投資額、表示設定、連携状態

### AI適性と見送り

Today画面では、各レースに現在の予測モデルとの相性をA〜Dで表示します。判定には必ず「類似条件レース数・過去ROI・過去的中率」をセットで使い、類似条件が50レース未満ならROIが高くても「データ不足」として自動見送りにします。

- A: 過去ROI 115%以上、十分なサンプルあり
- B: 過去ROI 103%以上、十分なサンプルあり
- C: 判断が難しい、またはデータ不足
- D: 過去ROI 88%未満

判定ルールは [suitability.ts](src/lib/keirin/suitability.ts) に分離しているため、将来は専用モデルへ差し替え可能です。「Aのみ」「A・Bのみ」「全レース」の戦略を切り替えられ、個別レースの購入／見送りも手動上書きできます。

見送りレースも `simulation_strategy_results` に仮想投資額・仮想払戻・的中有無を保存します。日次集計と実験画面では、全レース購入とAI適性A・B戦略の投資額・回収金・収支・ROI・購入数・見送り数を比較できます。

### ローカル起動

```bash
npm ci
cp .env.example .env.local
npm run dev
```

`http://localhost:3000/keirin` を開きます。Turso未設定時もサンプルデータで画面を確認でき、コメントと基準投資額はブラウザに保存されます。

### Turso設定とマイグレーション

`.env.local` に以下を設定します。

```dotenv
NEXT_PUBLIC_APP_URL=http://localhost:3000
TURSO_DATABASE_URL=libsql://your-database.turso.io
TURSO_AUTH_TOKEN=your-token
CRON_SECRET=replace-with-a-long-random-value
```

その後、全テーブル・UNIQUE制約・インデックスを作成します。

```bash
npm run db:migrate:keirin
```

AI適性の追加Migrationは `scripts/migrations/002_ai_suitability.sql` です。既存テーブルを破壊せず、以下を追加します。

- `suitability_condition_stats`: 条件別の過去バックテスト統計
- `prediction_suitability`: レース開始前に確定した適性スナップショット
- `simulation_strategy_results`: 購入・見送りを含むレース別戦略結果
- `daily_strategy_results`: 日次の戦略比較結果

`prediction_suitability` は `data_cutoff_at`、`calculated_at`、`rule_version` を保持します。対象レース開始後の情報や対象レース自身の結果は適性判定に使用しません。

コメントAPIはTurso設定時にDBへ保存し、未設定または一時的な通信失敗時はブラウザ保存へフォールバックします。

### 日次Cron

`vercel.json` は毎日 08:05 JST（23:05 UTC）に `/api/keirin/cron/daily` を呼びます。Vercelの `CRON_SECRET` を設定してください。日次集計は `result_date` のUNIQUE制約と upsert により再実行しても二重計上しません。V1のCronはDBに保存済みのレース結果・シミュレーション結果を集計します。外部の結果取得処理はデータ提供元のAPI仕様確定後に、このルートの前段へ接続します。

手動確認例：

```bash
curl -H "Authorization: Bearer $CRON_SECRET" http://localhost:3000/api/keirin/cron/daily
```

### ML Worker

学習・予測・実バックテストはWebリクエスト内では実行せず、ローカルPython WorkerからTursoへ結果を書き込む構成を想定しています。

```bash
python -m venv .venv
source .venv/bin/activate
pip install lightgbm pandas scikit-learn libsql-client
python worker/train.py
python worker/backtest.py
python worker/predict_today.py
```

V1画面のバックテスト操作は保存済み結果のデモです。Worker APIが未接続の場合は画面上にその旨を表示します。

### テストとビルド

```bash
npm run test:keirin
npx eslint 'src/app/keirin/**/*.{ts,tsx}' 'src/components/keirin/**/*.{ts,tsx}' 'src/lib/keirin/**/*.{ts,tsx}'
npm run build
```

ROIは `return_amount / investment * 100`、収支は `return_amount - investment` で計算し、投資額0円のROIは `null` です。テストにはサンプル不足判定、A・B戦略の選別、対象レース開始後のデータ参照拒否も含みます。

### Vercelデプロイ

Vercelプロジェクトに `.env.local` と同じ4つの環境変数を登録し、通常どおりGit連携または `vercel --prod` でデプロイします。DBファイルをVercelへ配置する必要はありません。
