"""保存済み予測へ公式結果を結合する。予測内容・適性は再計算しない。"""

from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from ml import load_events


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--data-dir", type=Path, default=Path("worker/data/raw"))
    parser.add_argument("--predictions", type=Path, default=Path("worker/out/today.json"))
    parser.add_argument("--output", type=Path, default=Path("worker/out/settled.json"))
    args = parser.parse_args()
    payload = json.loads(args.predictions.read_text(encoding="utf-8"))
    result_map = {}
    for event in load_events(args.data_dir):
        if event.get("race_date") != payload.get("race_date"):
            continue
        for race in event.get("races", []):
            key = f"{event.get('race_date')}:{event.get('venue_code')}:{race.get('race_number')}"
            if race.get("result"):
                result_map[key] = race["result"]
    settled = 0
    for race in payload.get("races", []):
        result = result_map.get(race["race_key"])
        if not result:
            continue
        race["actual_first"] = result["first_number"]
        race["actual_second"] = result["second_number"]
        race["payout_2t"] = result["payout_2t"]
        settled += 1
    payload["settled_at"] = datetime.now(timezone.utc).isoformat()
    payload["settled_race_count"] = settled
    args.output.parent.mkdir(parents=True, exist_ok=True)
    args.output.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"結果結合: {settled}/{len(payload.get('races', []))}レース -> {args.output}")


if __name__ == "__main__":
    main()
