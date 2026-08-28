import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  assessSuitability,
  assertNoSuitabilityDataLeak,
  evaluateStrategy,
  isEligibleForStrategy,
} from "./suitability.ts";

const base = {
  historicalHitRate: 24.1,
  calculatedAt: "2026-08-28T08:00:00+09:00",
  dataCutoffAt: "2026-08-27T23:59:59+09:00",
};

describe("AI適性判定", () => {
  it("十分なサンプルとROI 118.7%をA・購入候補と判定する", () => {
    const result = assessSuitability({ ...base, similarRaceCount: 428, historicalRoi: 118.7 });
    assert.equal(result.grade, "A");
    assert.equal(result.recommendation, "buy");
    assert.equal(result.isDataSufficient, true);
  });

  it("ROIが高くても50レース未満ならデータ不足として見送る", () => {
    const result = assessSuitability({ ...base, similarRaceCount: 12, historicalRoi: 145 });
    assert.equal(result.grade, "C");
    assert.equal(result.recommendation, "skip");
    assert.equal(result.isDataSufficient, false);
  });

  it("A・B戦略ではCとDを購入対象にしない", () => {
    assert.equal(isEligibleForStrategy("A", "suitability_ab"), true);
    assert.equal(isEligibleForStrategy("B", "suitability_ab"), true);
    assert.equal(isEligibleForStrategy("C", "suitability_ab"), false);
    assert.equal(isEligibleForStrategy("D", "suitability_ab"), false);
  });

  it("対象レース開始後のデータを参照した判定を拒否する", () => {
    const snapshot = assessSuitability({
      ...base,
      similarRaceCount: 428,
      historicalRoi: 118.7,
      dataCutoffAt: "2026-08-28T18:25:00+09:00",
    });
    assert.throws(() => assertNoSuitabilityDataLeak(snapshot, "2026-08-28T18:24:00+09:00"));
  });

  it("見送りを追跡したままA・B戦略のROI改善を集計する", () => {
    const races = [
      { grade: "A" as const, isDataSufficient: true, investment: 90000, returnAmount: 126000 },
      { grade: "B" as const, isDataSufficient: true, investment: 90000, returnAmount: 81000 },
      { grade: "C" as const, isDataSufficient: true, investment: 160000, returnAmount: 142000 },
      { grade: "D" as const, isDataSufficient: true, investment: 160000, returnAmount: 136000 },
    ];
    const all = evaluateStrategy(races, "all");
    const selected = evaluateStrategy(races, "suitability_ab");
    assert.equal(all.roi, 97);
    assert.equal(Math.round(selected.roi ?? 0), 115);
    assert.equal(selected.purchaseRaceCount, 2);
    assert.equal(selected.skippedRaceCount, 2);
  });
});
