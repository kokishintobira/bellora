import unittest

from keirin_source import KeirinSource, _extract_json, _extract_named_json
from ml import rolling_suitabilities


class SourceParserTest(unittest.TestCase):
    def test_extracts_single_and_double_quoted_assignments(self):
        source = "var pc0101_json = {\"ok\":true}; jsonData['PJ0306'] = {\"rows\":[1]};"
        self.assertTrue(_extract_json(source, "var pc0101_json")["ok"])
        self.assertEqual(_extract_named_json(source, "PJ0306")["rows"], [1])

    def test_normalizes_result(self):
        result = KeirinSource._normalize_result({
            "tyakui1List": [{"rclblSyaban": 7}],
            "tyakui2List": [{"rclblSyaban": 2}],
            "harai2syaList": [{"kumi": "7-2", "kingaku": "870円"}],
        })
        self.assertEqual(result, {"first_number": 7, "second_number": 2,
                                  "payout_2t": 870, "combination_2t": "7-2"})


class LeakageTest(unittest.TestCase):
    def test_suitability_uses_only_previous_races(self):
        rows = [{"race_date": f"2026-01-{index + 1:02d}", "race_key": str(index),
                 "venue_code": "22", "field_size": 7, "confidence_band": "high", "grade": "G3",
                 "predicted_first": 1, "predicted_second": 2,
                 "actual_first": 1, "actual_second": 2, "payout_2t": 120}
                for index in range(51)]
        snapshots = rolling_suitabilities(rows)
        self.assertEqual(snapshots[0]["similar_race_count"], 0)
        self.assertFalse(snapshots[49]["is_data_sufficient"])
        self.assertTrue(snapshots[50]["is_data_sufficient"])
        self.assertEqual(snapshots[50]["historical_roi"], 120.0)


if __name__ == "__main__":
    unittest.main()
