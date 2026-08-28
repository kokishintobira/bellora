import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  aggregateDailyResults,
  calculatePerformance,
  scalePerformance,
} from "./calculations.ts";

describe("競輪シミュレーション計算", () => {
  it("投資10,000円・回収12,000円を正しく計算する", () => {
    assert.deepEqual(calculatePerformance(10000, 12000), {
      investment: 10000,
      returnAmount: 12000,
      profit: 2000,
      roi: 120,
    });
  });

  it("投資0円ではROIをnullにして0除算を防ぐ", () => {
    assert.equal(calculatePerformance(0, 0).roi, null);
  });

  it("基準投資額に合わせて金額を比例換算する", () => {
    assert.deepEqual(
      scalePerformance(calculatePerformance(10000, 12000), 1000),
      calculatePerformance(20000, 24000),
    );
  });

  it("日次結果を合算してROIを再計算する", () => {
    const result = aggregateDailyResults([
      { id: "a", date: "2026-08-27", raceCount: 1, betCount: 1, strategies: [], races: [], ...calculatePerformance(500, 800) },
      { id: "b", date: "2026-08-28", raceCount: 1, betCount: 1, strategies: [], races: [], ...calculatePerformance(500, 0) },
    ]);
    assert.deepEqual(result, calculatePerformance(1000, 800));
  });
});
