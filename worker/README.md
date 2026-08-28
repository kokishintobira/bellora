# Keirin ML Worker

V1のWebアプリは長時間の機械学習処理を実行しません。学習・予測・バックテストはこのディレクトリに実装し、`TURSO_DATABASE_URL` と `TURSO_AUTH_TOKEN` を使ってWeb側と連携します。

データ提供元と学習用データセットが未確定のため、現時点ではコマンドの責務と入出力境界のみを定義しています。

- `train.py`: 特徴量生成、LightGBM学習、`models` 保存
- `predict_today.py`: 当日レース推論、`predictions` / `bets` 保存
- `backtest.py`: 過去期間の仮想投資、`experiments` 保存

適性判定用の集計は、バックテスト時に対象レースより前のデータだけを使って `suitability_condition_stats` を生成し、予測時点で `prediction_suitability` にスナップショットとして保存します。結果取得後は購入レースと見送りレースの双方を `simulation_strategy_results` へ保存してください。これにより、将来専用の「得意レース判定モデル」へ差し替えてもWeb側は変更不要です。

実データ取得アダプターを追加してもWeb側の画面・APIは変更不要です。
