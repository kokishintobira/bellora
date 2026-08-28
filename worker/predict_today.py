"""当日データを収集し、学習済みモデルで推論する。"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
from zoneinfo import ZoneInfo

import joblib

from keirin_source import KeirinSource
from ml import load_events, predict_races, rider_rows, suitability_for


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("worker/data/raw"))
    parser.add_argument("--model", type=Path, default=Path("worker/models/current.joblib"))
    parser.add_argument("--stats", type=Path, default=Path("worker/models/suitability_stats.json"))
    parser.add_argument("--output", type=Path, default=Path("worker/out/today.json"))
    parser.add_argument("--date", help="YYYY-MM-DD。省略時は公開中の最新開催日")
    parser.add_argument("--skip-collect", action="store_true")
    args = parser.parse_args()

    source = KeirinSource(args.data_dir)
    if not args.skip_collect:
        events = source.current_events()
        if args.date:
            events = [event for event in events if event.race_date == args.date]
        for event in events:
            payload = source.collect_event(event.token, include_odds=True)
            print(f"saved: {source.save_event(payload)}")

    artifact = joblib.load(args.model)
    stats = json.loads(args.stats.read_text(encoding="utf-8"))
    events = load_events(args.data_dir)
    target_date = args.date or max((event.get("race_date", "") for event in events), default="")
    frame = rider_rows([event for event in events if event.get("race_date") == target_date], completed_only=False)
    now_tokyo = datetime.now(ZoneInfo("Asia/Tokyo"))
    def has_not_started(row) -> bool:
        try:
            start = datetime.fromisoformat(f"{row['race_date']}T{row['start_time']}").replace(tzinfo=ZoneInfo("Asia/Tokyo"))
            return now_tokyo < start
        except (TypeError, ValueError):
            return False
    frame = frame[frame.apply(has_not_started, axis=1)] if not frame.empty else frame
    if frame.empty:
        raise SystemExit("発走前の対象レースがありません。保存済み予測は上書きしません。")
    rows, generated_at = predict_races(frame, artifact), datetime.now(timezone.utc).isoformat()
    for row in rows:
        row["suitability"] = suitability_for(row, stats)
        row["prediction_created_at"] = generated_at
        for result_key in ("actual_first", "actual_second", "payout_2t"):
            row.pop(result_key, None)
    payload = {"schema_version": 1, "generated_at": generated_at, "race_date": target_date,
               "model_version": artifact["version"], "model_data_cutoff_at": artifact["data_cutoff_at"],
               "feature_columns": artifact["feature_columns"],
               "training_race_count": artifact.get("training_race_count"),
               "validation_race_count": artifact.get("validation_race_count"),
               "suitability_data_cutoff_at": stats.get("data_cutoff_at", artifact["data_cutoff_at"]),
               "source": "keirin.jp", "races": rows}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"当日予測: {len(rows)}レース -> {args.output}")


if __name__ == "__main__":
    main()
