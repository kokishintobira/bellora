"""公式データのレース前特徴量から LightGBM モデルを学習する。"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

import joblib
from lightgbm import LGBMClassifier

from ml import FEATURE_COLUMNS, load_events, rider_rows


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("worker/data/raw"))
    parser.add_argument("--output", type=Path, default=Path("worker/models/current.joblib"))
    parser.add_argument("--metadata", type=Path, default=Path("worker/models/current.json"))
    parser.add_argument("--min-races", type=int, default=200)
    parser.add_argument("--validation-ratio", type=float, default=0.2)
    parser.add_argument("--final", action="store_true", help="評価後、全確定データで本番推論モデルを再学習")
    args = parser.parse_args()

    frame = rider_rows(load_events(args.data_dir), completed_only=True)
    race_dates = sorted(frame["race_date"].unique()) if not frame.empty else []
    race_count = frame["race_key"].nunique() if not frame.empty else 0
    if race_count < args.min_races or len(race_dates) < 2:
        raise SystemExit(f"学習データ不足: {race_count}レース（必要: {args.min_races}レース以上・2日以上）")

    if args.final:
        cutoff_date = race_dates[-1]
        train = frame
        validation = frame.iloc[0:0]
    else:
        split_index = max(1, int(len(race_dates) * (1 - args.validation_ratio)))
        cutoff_date = race_dates[min(split_index - 1, len(race_dates) - 2)]
        train = frame[frame["race_date"] <= cutoff_date]
        validation = frame[frame["race_date"] > cutoff_date]
    if train["target_first"].nunique() < 2 or (validation.empty and not args.final):
        raise SystemExit("時系列分割後の学習・検証データが不足しています")

    common = {"n_estimators": 300, "learning_rate": 0.04, "num_leaves": 31,
              "subsample": 0.9, "colsample_bytree": 0.9, "random_state": 42,
              "n_jobs": -1, "verbosity": -1}
    first_model, second_model = LGBMClassifier(**common), LGBMClassifier(**common)
    first_model.fit(train[FEATURE_COLUMNS], train["target_first"])
    second_model.fit(train[FEATURE_COLUMNS], train["target_second"])

    version = datetime.now(timezone.utc).strftime("lgbm-final-%Y%m%dT%H%M%SZ" if args.final else "lgbm-%Y%m%dT%H%M%SZ")
    artifact = {"version": version, "created_at": datetime.now(timezone.utc).isoformat(),
                "data_cutoff_at": cutoff_date, "feature_columns": FEATURE_COLUMNS,
                "training_race_count": int(train["race_key"].nunique()),
                "validation_race_count": int(validation["race_key"].nunique()),
                "first_model": first_model, "second_model": second_model}
    args.output.parent.mkdir(parents=True, exist_ok=True)
    joblib.dump(artifact, args.output)
    metadata = {key: artifact[key] for key in ("version", "created_at", "data_cutoff_at", "feature_columns")}
    metadata.update({"training_race_count": artifact["training_race_count"],
                     "validation_race_count": artifact["validation_race_count"],
                     "source": "keirin.jp",
                     "leakage_policy": "race_date <= data_cutoff_at; result fields excluded from features"})
    args.metadata.write_text(json.dumps(metadata, ensure_ascii=False, indent=2), encoding="utf-8")
    print(json.dumps(metadata, ensure_ascii=False, indent=2))


if __name__ == "__main__":
    main()
