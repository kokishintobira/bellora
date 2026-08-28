"""KEIRIN.JP の公開ページを低頻度で取得する個人利用向けアダプター。

公開 HTML 内の JSON を正規化して保存する。結果フィールドは ``result`` 配下へ
隔離し、学習特徴量へ誤って混入しない構造にしている。
"""

from __future__ import annotations

import html
import http.cookiejar
import json
import os
import re
import time
import urllib.parse
import urllib.request
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Iterable


BASE_URL = "https://keirin.jp"
USER_AGENT = os.getenv(
    "KEIRIN_USER_AGENT",
    "bellora-personal-research/1.0 (private, low-frequency data collection)",
)


def _as_list(value: Any) -> list[dict[str, Any]]:
    if isinstance(value, list):
        return [item for item in value if isinstance(item, dict)]
    if isinstance(value, dict):
        return [item for item in value.values() if isinstance(item, dict)]
    return []


def _number(value: Any) -> float | None:
    if value is None or value == "":
        return None
    cleaned = re.sub(r"[^0-9.\-]", "", str(value).replace(",", ""))
    try:
        return float(cleaned) if cleaned else None
    except ValueError:
        return None


def _integer(value: Any) -> int | None:
    parsed = _number(value)
    return int(parsed) if parsed is not None else None


def _extract_json(source: str, variable: str) -> Any:
    """``variable = {...};`` の右辺を JSONDecoder で安全に切り出す。"""
    match = re.search(re.escape(variable) + r"\s*=\s*", source)
    if not match:
        raise ValueError(f"ページ内に {variable} が見つかりません")
    value, _ = json.JSONDecoder().raw_decode(source, match.end())
    return value


def _extract_named_json(source: str, name: str) -> Any:
    for quote in ("'", '"'):
        try:
            return _extract_json(source, f"jsonData[{quote}{name}{quote}]")
        except ValueError:
            pass
    raise ValueError(f"ページ内に jsonData[{name}] が見つかりません")


def _event_tokens(source: str) -> list[str]:
    tokens = re.findall(r'data-pprm-encp=["\']([^"\']+)', source)
    return list(dict.fromkeys(html.unescape(token) for token in tokens))


@dataclass(frozen=True)
class Event:
    race_date: str
    venue: str
    venue_code: str
    grade: str
    token: str


class KeirinSource:
    def __init__(self, cache_dir: Path, interval_seconds: float = 1.2) -> None:
        self.cache_dir = cache_dir
        self.interval_seconds = max(interval_seconds, 0.5)
        self._last_request_at = 0.0
        jar = http.cookiejar.CookieJar()
        self.opener = urllib.request.build_opener(urllib.request.HTTPCookieProcessor(jar))

    def _request(
        self,
        path: str,
        *,
        form: dict[str, str] | None = None,
        referer: str | None = None,
        retries: int = 3,
    ) -> str:
        elapsed = time.monotonic() - self._last_request_at
        if elapsed < self.interval_seconds:
            time.sleep(self.interval_seconds - elapsed)
        data = urllib.parse.urlencode(form).encode() if form else None
        headers = {"User-Agent": USER_AGENT, "Accept-Language": "ja,en;q=0.5"}
        if referer:
            headers["Referer"] = referer
        request = urllib.request.Request(BASE_URL + path, data=data, headers=headers)
        for attempt in range(retries):
            try:
                with self.opener.open(request, timeout=30) as response:
                    self._last_request_at = time.monotonic()
                    return response.read().decode("utf-8", errors="replace")
            except Exception:
                if attempt + 1 == retries:
                    raise
                time.sleep(2**attempt)
        raise RuntimeError("unreachable")

    def schedule(self, year: int | None = None, month: int | None = None) -> tuple[str, Any]:
        query = ""
        if year is not None and month is not None:
            query = "?" + urllib.parse.urlencode({"scyy": year, "scym": f"{month:02d}"})
        page = self._request("/pc/raceschedule" + query)
        schedule = _extract_json(page, "var pc0101_json")
        return page, schedule

    def current_events(self) -> list[Event]:
        _, schedule = self.schedule()
        rows = schedule.get("RaceList", []) if isinstance(schedule, dict) else []
        events: list[Event] = []
        for row in _as_list(rows):
            token = str(row.get("touhyouLivePara") or "")
            if not token:
                continue
            raw_date = str(row.get("kaisaiDate") or "")
            race_date = (
                f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:8]}"
                if len(raw_date) == 8
                else raw_date
            )
            events.append(
                Event(
                    race_date=race_date,
                    venue=str(row.get("keirinjoName") or ""),
                    venue_code=str(row.get("naibuKeirinCd") or ""),
                    grade=str(row.get("gradeKbn") or row.get("gradeIconName") or ""),
                    token=token,
                )
            )
        unique = {(e.race_date, e.venue_code): e for e in events}
        return list(unique.values())

    def month_tokens(self, year: int, month: int) -> list[str]:
        page, _ = self.schedule(year, month)
        return _event_tokens(page)

    def _race_page(self, token: str, display: str) -> str:
        return self._request(
            "/pc/racelist",
            form={"encp": token, "disp": display},
            referer=BASE_URL + "/pc/raceschedule",
        )

    def _live_page(self, token: str) -> str:
        return self._request(
            "/pc/racelive",
            form={"encp": token, "disp": "PJ0307"},
            referer=BASE_URL + "/pc/racelist",
        )

    def odds_2t(self, token: str) -> dict[str, Any]:
        query = urllib.parse.urlencode({"type": "JST011", "kake": "2", "mode": "0", "encp": token})
        payload = json.loads(
            self._request("/pc/json?" + query, referer=BASE_URL + "/pc/racelist")
        )
        return payload.get("data", payload)

    def collect_event(self, token: str, *, include_odds: bool = True) -> dict[str, Any]:
        program_page = self._race_page(token, "PJ0305")
        base_payload = _extract_named_json(program_page, "PC0201")
        base = base_payload.get("C0201data", base_payload)
        try:
            program = _extract_named_json(program_page, "PJ0305")
        except ValueError:
            program = _extract_named_json(program_page, "PJ0301")

        race_token_rows = _as_list(base.get("C0201race"))
        program_days = _as_list(program.get("raceDayDataList"))
        selected_digits = re.sub(r"[^0-9]", "", str(base.get("selKaisai") or ""))
        selected_mmdd = f"{selected_digits[4:6]}/{selected_digits[6:8]}" if len(selected_digits) >= 8 else ""
        event_days = _as_list(base.get("C0201kaisai"))
        selected_index = next(
            (index for index, day in enumerate(event_days) if str(day.get("txtEventDate")) == selected_mmdd),
            0,
        )
        if not race_token_rows and selected_index < len(program_days):
            race_token_rows.extend(_as_list(program_days[selected_index].get("raceNoDataList")))
        race_tokens = {}
        for index, row in enumerate(race_token_rows):
            race_no = _integer(row.get("raceNo") or row.get("strRaceNo")) or index + 1
            race_token = str(row.get("touhyouLivePara") or row.get("encp") or row.get("encParaR") or row.get("strLnkPrm") or "")
            if race_no is not None and race_token:
                race_tokens[race_no] = race_token
        live_token = str(base.get("encSelParaR") or base.get("encParaR") or (next(iter(race_tokens.values())) if race_tokens else ""))
        if not live_token:
            raise ValueError(f"レース詳細トークンを取得できませんでした (base keys: {sorted(base.keys())})")
        live_page = self._live_page(live_token)
        live = _extract_named_json(live_page, "PJ0307")
        result_page = self._race_page(token, "PJ0306")
        results = _extract_named_json(result_page, "PJ0306")

        selected = base
        raw_date = str(
            selected.get("kaisaiDate")
            or selected.get("selKaisai")
            or selected.get("kday")
            or program.get("kaisaiDate")
            or results.get("kday")
            or ""
        )
        raw_date = re.sub(r"[^0-9]", "", raw_date)
        race_date = f"{raw_date[:4]}-{raw_date[4:6]}-{raw_date[6:8]}" if len(raw_date) >= 8 else raw_date
        venue = str(
            selected.get("keirinjoName")
            or selected.get("joName")
            or selected.get("jyoName")
            or program.get("keirinjoName")
            or ""
        )
        venue_code = str(
            selected.get("naibuKeirinCd")
            or selected.get("selKjyoCd")
            or selected.get("bkcd")
            or results.get("bkcd")
            or ""
        )

        program_by_no = {int(row.get("raceNo")): row for row in _as_list(program.get("syusouList"))
                         if _integer(row.get("raceNo")) is not None}
        live_by_no = {
            int(row.get("raceNo")): row
            for row in _as_list(live.get("raceInfo"))
            if _integer(row.get("raceNo")) is not None
        }
        result_by_no = {
            int(_integer(row.get("rclblRaceNo") or row.get("raceNo"))): row
            for row in _as_list(results.get("resultList"))
            if _integer(row.get("rclblRaceNo") or row.get("raceNo")) is not None
        }

        races: list[dict[str, Any]] = []
        for race_no, detail in sorted(live_by_no.items()):
            p_row = program_by_no.get(race_no, {})
            entries = []
            for rider in _as_list(detail.get("sensyuTypeInfo")):
                entries.append(
                    {
                        "car_number": _integer(rider.get("syaban")),
                        "registration_number": str(rider.get("sensyuRegistNo") or ""),
                        "name": str(rider.get("sensyuName") or ""),
                        "prefecture": str(rider.get("huKen") or ""),
                        "age": _integer(rider.get("age")),
                        "class": str(rider.get("kyuhan") or rider.get("prevKyuhan") or ""),
                        "style": str(rider.get("kyakusitu") or ""),
                        "average_score": _number(rider.get("heikinTokuten")),
                        "win_rate": _number(rider.get("syouritu")),
                        "top2_rate": _number(rider.get("rentairitu2")),
                        "top3_rate": _number(rider.get("rentairitu3")),
                        "escape_count": _integer(rider.get("nigeCnt")),
                        "sprint_count": _integer(rider.get("makuriCnt")),
                        "overtake_count": _integer(rider.get("sasiCnt")),
                        "mark_count": _integer(rider.get("markCnt")),
                        "back_count": _integer(rider.get("backCnt")),
                        "home_count": _integer(rider.get("homeTori")),
                        "start_count": _integer(rider.get("stTori")),
                    }
                )

            result = self._normalize_result(result_by_no.get(race_no))
            odds_token = race_tokens.get(race_no)
            odds = self._normalize_odds(self.odds_2t(odds_token)) if include_odds and odds_token else {}
            races.append(
                {
                    "race_number": race_no,
                    "race_name": str(detail.get("shumokuName") or p_row.get("syumoku") or ""),
                    "distance": _integer(detail.get("kyori")),
                    "start_time": str(detail.get("hassouYotei") or p_row.get("stTime") or ""),
                    "sales_close_time": str(detail.get("dentoShimekiri") or p_row.get("denTime") or ""),
                    "field_size": len(entries),
                    "entries": entries,
                    "odds_2t": odds,
                    "result": result,
                }
            )

        payload = {
            "schema_version": 1,
            "source": "keirin.jp",
            "collected_at": datetime.now(timezone.utc).isoformat(),
            "race_date": race_date,
            "venue": venue,
            "venue_code": venue_code,
            "grade": str(selected.get("gradeKbn") or selected.get("gradeName") or selected.get("imgGradeAlt") or ""),
            "races": races,
            "_related_event_tokens": [
                str(day.get("encParaK")) for day in _as_list(base.get("C0201kaisai")) if day.get("encParaK")
            ],
        }
        return payload

    @staticmethod
    def _normalize_result(row: dict[str, Any] | None) -> dict[str, Any] | None:
        if not row:
            return None
        first = next(iter(_as_list(row.get("tyakui1List"))), {})
        second = next(iter(_as_list(row.get("tyakui2List"))), {})
        payout_rows = _as_list(row.get("harai2syaList"))
        payout = payout_rows[0] if payout_rows else {}
        first_number = _integer(first.get("rclblSyaban") or first.get("syaban"))
        second_number = _integer(second.get("rclblSyaban") or second.get("syaban"))
        if first_number is None or second_number is None:
            return None
        return {
            "first_number": first_number,
            "second_number": second_number,
            "payout_2t": _integer(payout.get("kingaku")) or 0,
            "combination_2t": str(payout.get("kumi") or f"{first_number}-{second_number}"),
        }

    @staticmethod
    def _normalize_odds(data: dict[str, Any]) -> dict[str, float]:
        source = data.get("ozz2SyatanData") or {}
        normalized: dict[str, float] = {}
        if isinstance(source, dict):
            for key, value in source.items():
                if not str(key).startswith("OZZ"):
                    continue
                digits = re.sub(r"[^0-9]", "", str(key))
                if len(digits) < 2:
                    continue
                odds = _number(value)
                if odds is not None:
                    normalized[f"{digits[-2]}-{digits[-1]}"] = odds
        return normalized

    def save_event(self, payload: dict[str, Any]) -> Path:
        race_date = payload.get("race_date") or "unknown-date"
        venue_code = payload.get("venue_code") or "unknown-venue"
        target = self.cache_dir / str(race_date) / f"{venue_code}.json"
        target.parent.mkdir(parents=True, exist_ok=True)
        persisted = dict(payload)
        persisted.pop("_related_event_tokens", None)
        target.write_text(json.dumps(persisted, ensure_ascii=False, indent=2), encoding="utf-8")
        return target


def iter_event_files(root: Path) -> Iterable[Path]:
    yield from sorted(root.glob("????-??-??/*.json"))
