"""公式ページから開催データを収集して正規化 JSON として保存する。"""

from __future__ import annotations

import argparse
from pathlib import Path

from keirin_source import KeirinSource


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--cache-dir", type=Path, default=Path("worker/data/raw"))
    parser.add_argument("--date", help="YYYY-MM-DD。省略時は公開中の全開催")
    parser.add_argument("--month", help="YYYY-MM。過去データの収集")
    parser.add_argument("--no-odds", action="store_true")
    parser.add_argument("--limit", type=int, default=0, help="動作確認用の開催数上限")
    parser.add_argument("--strict", action="store_true", help="1開催の失敗でも直ちに終了")
    args = parser.parse_args()

    source = KeirinSource(args.cache_dir)
    if args.month:
        year, month = (int(value) for value in args.month.split("-"))
        tokens = source.month_tokens(year, month)
    else:
        events = source.current_events()
        if args.date:
            events = [event for event in events if event.race_date == args.date]
        tokens = [event.token for event in events]

    if args.limit > 0:
        tokens = tokens[: args.limit]
    if not tokens:
        raise SystemExit("対象開催が見つかりませんでした")

    completed = 0
    failed = 0
    seen: set[tuple[str, str]] = set()
    seen_tokens: set[str] = set()
    for token in tokens:
        if token in seen_tokens:
            continue
        seen_tokens.add(token)
        try:
            payload = source.collect_event(token, include_odds=not args.no_odds)
        except Exception as error:
            failed += 1
            print(f"failed: {type(error).__name__}: {error}")
            if args.strict:
                raise
            continue
        if args.month:
            for related_token in payload.get("_related_event_tokens", []):
                if related_token not in seen_tokens:
                    tokens.append(related_token)
        key = (str(payload.get("race_date")), str(payload.get("venue_code")))
        if key in seen:
            continue
        seen.add(key)
        path = source.save_event(payload)
        completed += 1
        print(f"saved: {path}")
    print(f"収集完了: {completed}開催 / 失敗: {failed}開催")
    if completed == 0:
        raise SystemExit("収集できた開催がありませんでした")


if __name__ == "__main__":
    main()
