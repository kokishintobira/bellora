"""学習期間より後のデータだけを使う時系列バックテスト。"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib

from ml import build_suitability_stats, load_events, predict_races, rider_rows, rolling_suitabilities


def performance(rows: list[dict], strategy: str, stake: int) -> dict:
    selected = []
    for row in rows:
        grade = row["suitability"]["grade"]
        buy = strategy == "all" or (strategy == "suitability_a" and grade == "A") or (
            strategy == "suitability_ab" and grade in ("A", "B"))
        if buy:
            selected.append(row)
    investment, returned = len(selected) * stake, sum(row["hypothetical_return_amount"] for row in selected)
    return {"strategy_key": strategy, "purchase_race_count": len(selected),
            "skipped_race_count": len(rows) - len(selected), "investment": investment,
            "return_amount": returned, "profit": returned - investment,
            "roi": round(returned / investment * 100, 2) if investment else None}


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("worker/data/raw"))
    parser.add_argument("--model", type=Path, default=Path("worker/models/current.joblib"))
    parser.add_argument("--output", type=Path, default=Path("worker/out/backtest.json"))
    parser.add_argument("--stats", type=Path, default=Path("worker/models/suitability_stats.json"))
    parser.add_argument("--stake", type=int, default=100)
    args = parser.parse_args()

    artifact = joblib.load(args.model)
    frame = rider_rows(load_events(args.data_dir), completed_only=True)
    predictions = predict_races(frame[frame["race_date"] > artifact["data_cutoff_at"]], artifact)
    if not predictions:
        raise SystemExit("学習期間後のバックテスト対象がありません")
    predictions.sort(key=lambda row: (row["race_date"], row["race_key"]))
    suitability_snapshots = rolling_suitabilities(predictions, args.stake)
    stats = build_suitability_stats(predictions, args.stake)
    stats["data_cutoff_at"] = predictions[-1]["race_date"]
    rows = []
    for prediction, suitability in zip(predictions, suitability_snapshots):
        hit = prediction["predicted_first"] == prediction["actual_first"] and prediction["predicted_second"] == prediction["actual_second"]
        prediction.update({"is_hit": hit, "hypothetical_investment": args.stake,
                           "hypothetical_return_amount": prediction["payout_2t"] * (args.stake // 100) if hit else 0,
                           "suitability": suitability})
        rows.append(prediction)
    payload = {"schema_version": 1, "generated_at": datetime.now(timezone.utc).isoformat(),
               "model_version": artifact["version"], "data_cutoff_at": artifact["data_cutoff_at"],
               "feature_columns": artifact["feature_columns"],
               "training_race_count": artifact.get("training_race_count"),
               "validation_race_count": artifact.get("validation_race_count"),
               "period": {"from": rows[0]["race_date"], "to": rows[-1]["race_date"]}, "stake": args.stake,
               "strategies": [performance(rows, key, args.stake) for key in ("all", "suitability_a", "suitability_ab")],
               "races": rows}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.stats.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    args.stats.write_text(json.dumps(stats, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(payload["strategies"], ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
