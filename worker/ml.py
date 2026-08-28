"""競輪予測 Worker の共通特徴量・推論・適性集計。"""

from __future__ import annotations

import hashlib
import json
import math
from collections import defaultdict
from pathlib import Path
from typing import Any, Iterable

import pandas as pd

from keirin_source import iter_event_files

FEATURE_COLUMNS = [
    "car_number", "field_size", "race_number", "venue_code", "grade_code",
    "class_code", "style_code", "age", "average_score", "score_gap_from_best",
    "win_rate", "top2_rate", "top3_rate", "escape_count", "sprint_count",
    "overtake_count", "mark_count", "back_count", "home_count", "start_count",
]


def _code(value: Any) -> int:
    if value is None or value == "":
        return 0
    digest = hashlib.blake2b(str(value).encode("utf-8"), digest_size=2).digest()
    return int.from_bytes(digest, "big")


def _float(value: Any) -> float:
    try:
        result = float(value)
        return result if math.isfinite(result) else 0.0
    except (TypeError, ValueError):
        return 0.0


def load_events(root: Path) -> list[dict[str, Any]]:
    events = []
    for path in iter_event_files(root):
        payload = json.loads(path.read_text(encoding="utf-8"))
        if payload.get("schema_version") == 1:
            events.append(payload)
    return sorted(events, key=lambda row: (row.get("race_date", ""), row.get("venue_code", "")))


def rider_rows(events: Iterable[dict[str, Any]], *, completed_only: bool) -> pd.DataFrame:
    rows: list[dict[str, Any]] = []
    for event in events:
        for race in event.get("races", []):
            result = race.get("result")
            if completed_only and not result:
                continue
            entries = race.get("entries") or []
            best_score = max((_float(item.get("average_score")) for item in entries), default=0.0)
            race_key = f"{event.get('race_date')}:{event.get('venue_code')}:{race.get('race_number')}"
            for item in entries:
                car_number = int(item.get("car_number") or 0)
                row = {
                    "race_key": race_key, "race_date": event.get("race_date", ""),
                    "venue": event.get("venue", ""), "venue_code_raw": str(event.get("venue_code", "")),
                    "grade_raw": str(event.get("grade", "")), "start_time": race.get("start_time", ""),
                    "race_name": race.get("race_name", ""), "car_number": car_number,
                    "field_size": int(race.get("field_size") or len(entries)),
                    "race_number": int(race.get("race_number") or 0),
                    "venue_code": _float(event.get("venue_code")), "grade_code": _code(event.get("grade")),
                    "class_code": _code(item.get("class")), "style_code": _code(item.get("style")),
                    "age": _float(item.get("age")), "average_score": _float(item.get("average_score")),
                    "score_gap_from_best": best_score - _float(item.get("average_score")),
                    "win_rate": _float(item.get("win_rate")), "top2_rate": _float(item.get("top2_rate")),
                    "top3_rate": _float(item.get("top3_rate")), "escape_count": _float(item.get("escape_count")),
                    "sprint_count": _float(item.get("sprint_count")), "overtake_count": _float(item.get("overtake_count")),
                    "mark_count": _float(item.get("mark_count")), "back_count": _float(item.get("back_count")),
                    "home_count": _float(item.get("home_count")), "start_count": _float(item.get("start_count")),
                    "actual_first": int((result or {}).get("first_number") or 0),
                    "actual_second": int((result or {}).get("second_number") or 0),
                    "payout_2t": int((result or {}).get("payout_2t") or 0),
                    "odds_2t": race.get("odds_2t") or {},
                }
                row["target_first"] = int(car_number == row["actual_first"])
                row["target_second"] = int(car_number == row["actual_second"])
                rows.append(row)
    return pd.DataFrame(rows)


def confidence_band(gap: float) -> str:
    return "high" if gap >= 0.15 else "medium" if gap >= 0.06 else "low"


def predict_races(frame: pd.DataFrame, artifact: dict[str, Any]) -> list[dict[str, Any]]:
    if frame.empty:
        return []
    work = frame.copy()
    work["prob_first"] = artifact["first_model"].predict_proba(work[FEATURE_COLUMNS])[:, 1]
    work["prob_second"] = artifact["second_model"].predict_proba(work[FEATURE_COLUMNS])[:, 1]
    predictions = []
    for race_key, group in work.groupby("race_key", sort=False):
        first_row = group.sort_values("prob_first", ascending=False).iloc[0]
        remaining = group[group["car_number"] != first_row["car_number"]]
        second_row = remaining.sort_values("prob_second", ascending=False).iloc[0]
        probabilities = group["prob_first"].sort_values(ascending=False).tolist()
        gap = probabilities[0] - probabilities[1] if len(probabilities) > 1 else probabilities[0]
        combination = f"{int(first_row['car_number'])}-{int(second_row['car_number'])}"
        odds_map = first_row.get("odds_2t") or {}
        odds = _float(odds_map.get(combination)) if isinstance(odds_map, dict) else 0.0
        predictions.append({
            "race_key": race_key, "race_date": first_row["race_date"], "venue": first_row["venue"],
            "venue_code": first_row["venue_code_raw"], "grade": first_row["grade_raw"],
            "race_number": int(first_row["race_number"]), "race_name": first_row["race_name"],
            "start_time": first_row["start_time"], "field_size": int(first_row["field_size"]),
            "predicted_first": int(first_row["car_number"]), "predicted_second": int(second_row["car_number"]),
            "probability_first": round(float(first_row["prob_first"]), 6),
            "confidence_gap": round(float(gap), 6), "confidence_band": confidence_band(float(gap)),
            "combination": combination, "odds": odds,
            "expected_value": round(float(first_row["prob_first"]) * odds, 4),
            "actual_first": int(first_row["actual_first"]), "actual_second": int(first_row["actual_second"]),
            "payout_2t": int(first_row["payout_2t"]),
        })
    return predictions


def condition_keys(row: dict[str, Any]) -> list[str]:
    venue, field, confidence, grade = (
        row.get("venue_code") or "unknown", row.get("field_size") or 0,
        row.get("confidence_band") or "low", row.get("grade") or "unknown",
    )
    return [f"venue={venue}|field={field}|confidence={confidence}|grade={grade}",
            f"field={field}|confidence={confidence}|grade={grade}",
            f"field={field}|confidence={confidence}", f"confidence={confidence}", "all"]


def build_suitability_stats(predictions: list[dict[str, Any]], stake: int = 100) -> dict[str, Any]:
    buckets: dict[str, list[dict[str, Any]]] = defaultdict(list)
    for prediction in sorted(predictions, key=lambda row: (row["race_date"], row["race_key"])):
        hit = prediction["predicted_first"] == prediction["actual_first"] and prediction["predicted_second"] == prediction["actual_second"]
        returned = prediction["payout_2t"] * (stake // 100) if hit else 0
        for key in condition_keys(prediction):
            buckets[key].append({"is_hit": hit, "return_amount": returned})
    stats = {}
    for key, rows in buckets.items():
        investment, returned = len(rows) * stake, sum(row["return_amount"] for row in rows)
        stats[key] = {"sample_count": len(rows), "investment": investment, "return_amount": returned,
                      "roi": round(returned / investment * 100, 2) if investment else 0,
                      "hit_rate": round(sum(row["is_hit"] for row in rows) / len(rows) * 100, 2)}
    return {"rule_version": "roi-rules-v1", "minimum_sample_count": 50, "conditions": stats}


def rolling_suitabilities(predictions: list[dict[str, Any]], stake: int = 100) -> list[dict[str, Any]]:
    """各対象レースより前の結果だけで適性を算出する（データリーク防止）。"""
    buckets: dict[str, dict[str, int]] = defaultdict(
        lambda: {"sample_count": 0, "investment": 0, "return_amount": 0, "hits": 0}
    )
    snapshots = []
    for prediction in sorted(predictions, key=lambda row: (row["race_date"], row["race_key"])):
        conditions = {}
        for key, bucket in buckets.items():
            count, investment = bucket["sample_count"], bucket["investment"]
            conditions[key] = {
                "sample_count": count, "investment": investment,
                "return_amount": bucket["return_amount"],
                "roi": round(bucket["return_amount"] / investment * 100, 2) if investment else 0,
                "hit_rate": round(bucket["hits"] / count * 100, 2) if count else 0,
            }
        snapshots.append(suitability_for(prediction, {
            "rule_version": "roi-rules-v1", "minimum_sample_count": 50, "conditions": conditions,
        }))
        hit = prediction["predicted_first"] == prediction["actual_first"] and prediction["predicted_second"] == prediction["actual_second"]
        returned = prediction["payout_2t"] * (stake // 100) if hit else 0
        for key in condition_keys(prediction):
            bucket = buckets[key]
            bucket["sample_count"] += 1
            bucket["investment"] += stake
            bucket["return_amount"] += returned
            bucket["hits"] += int(hit)
    return snapshots


def suitability_for(row: dict[str, Any], payload: dict[str, Any]) -> dict[str, Any]:
    minimum, conditions = int(payload.get("minimum_sample_count", 50)), payload.get("conditions", {})
    selected_key, stats = "all", conditions.get("all", {"sample_count": 0, "roi": 0, "hit_rate": 0})
    for key in condition_keys(row):
        candidate = conditions.get(key)
        if candidate and int(candidate.get("sample_count", 0)) >= minimum:
            selected_key, stats = key, candidate
            break
    sample_count, roi = int(stats.get("sample_count", 0)), float(stats.get("roi", 0))
    sufficient = sample_count >= minimum
    grade = "C" if not sufficient else "A" if roi >= 110 else "B" if roi >= 100 else "C" if roi >= 85 else "D"
    return {"grade": grade, "similar_race_count": sample_count, "historical_roi": roi,
            "historical_hit_rate": float(stats.get("hit_rate", 0)), "is_data_sufficient": sufficient,
            "recommendation": "buy" if sufficient and grade in ("A", "B") else "skip",
            "condition_key": selected_key, "rule_version": payload.get("rule_version", "roi-rules-v1")}
