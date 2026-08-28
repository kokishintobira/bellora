# Keirin ML Worker（実運用）

個人利用を前提に、KEIRIN.JP の公開ページを低頻度で取得し、LightGBMによる予測・時系列バックテスト・結果検証を行います。投票や実車券購入は行いません。取得元の利用条件を守り、収集データを公開・再配布しないでください。

## データと数値の区別

- 本番（`NEXT_PUBLIC_KEIRIN_DEMO_MODE=false`）: Tursoへ保存された公式データ由来の数値だけを表示します。
- デモ（`NEXT_PUBLIC_KEIRIN_DEMO_MODE=true`）: `src/lib/keirin/data.ts` の固定サンプルを表示します。
- 本番でDBやデータがない場合、固定値へ自動フォールバックしません。

## 初期セットアップ

```sh
python3 -m venv .venv
.venv/bin/pip install -r worker/requirements.txt
cp .env.example .env.local
npm run db:migrate:keirin
```

`.env.local` にはTurso接続情報、Vercel cron secret、個人閲覧用のBasic認証情報を設定します。元データ・モデルファイル・出力JSONはgit管理外です。

## 過去データ収集と初回学習

月単位で順番に実行します。公式サイトへ負荷をかけないよう、リクエスト間隔はアダプター内で制限しています。

```sh
.venv/bin/python worker/collect.py --month 2026-01 --no-odds
.venv/bin/python worker/collect.py --month 2026-02 --no-odds
.venv/bin/python worker/train.py
.venv/bin/python worker/backtest.py
npm run keirin:import:backtest
.venv/bin/python worker/train.py --final
```

学習には既定で200レース以上かつ2日以上が必要です。日付順の前方80%だけで評価モデルを学習し、後方20%をバックテストに使います。評価を保存した後、`--final` で全確定データを使う本番推論モデルへ更新します。着順・払戻は特徴量から除外されています。適性判定も各対象レースより前のバックテスト結果だけで決定します。

## 日次運用

朝（発走前）:

```sh
scripts/run-keirin-morning.sh
```

夜（全レース確定後）:

```sh
scripts/run-keirin-evening.sh
```

朝に作った予測と適性スナップショットは夜に再計算せず、公式結果だけを結合します。見送りレースも仮想投資結果としてDBへ残ります。macOSでは `launchd` などから朝夕スクリプトを呼び出せますが、Macが起動している必要があります。

## 生成物

- `worker/data/raw/`: 取得した正規化JSON
- `worker/models/current.joblib`: 学習済みLightGBM
- `worker/models/current.json`: 学習期間・特徴量・件数
- `worker/models/suitability_stats.json`: 適性条件別のサンプル数・ROI・的中率
- `worker/out/backtest.json`: 時系列バックテスト
- `worker/out/today.json`: 発走前予測
- `worker/out/settled.json`: 予測へ結果だけを結合した日次確定データ

これは仮想投資の検証システムであり、利益を保証しません。モデル更新時は新しいversionとして保存し、過去予測を上書きしないでください。
