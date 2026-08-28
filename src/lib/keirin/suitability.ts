import type {
  PurchaseDecision,
  StrategyKey,
  SuitabilityGrade,
  SuitabilitySnapshot,
  StrategyPerformance,
} from "./types";
import { calculatePerformance } from "./calculations.ts";

export const MIN_SUITABILITY_SAMPLE_SIZE = 50;
export const SUITABILITY_RULE_VERSION = "roi-bands-v1";

export type SuitabilityInput = {
  similarRaceCount: number;
  historicalRoi: number;
  historicalHitRate: number;
  calculatedAt: string;
  dataCutoffAt: string;
};

/**
 * 過去に確定した類似条件の集計だけから適性を判定する。
 * 対象レースの着順・払戻は入力型に含めず、判定ルールを差し替え可能にする。
 */
export function assessSuitability(input: SuitabilityInput): SuitabilitySnapshot {
  const isDataSufficient = input.similarRaceCount >= MIN_SUITABILITY_SAMPLE_SIZE;
  let grade: SuitabilityGrade;

  if (!isDataSufficient) grade = "C";
  else if (input.historicalRoi >= 115) grade = "A";
  else if (input.historicalRoi >= 103) grade = "B";
  else if (input.historicalRoi >= 88) grade = "C";
  else grade = "D";

  return {
    ...input,
    grade,
    isDataSufficient,
    recommendation: isDataSufficient && (grade === "A" || grade === "B") ? "buy" : "skip",
    ruleVersion: SUITABILITY_RULE_VERSION,
  };
}

export function isEligibleForStrategy(grade: SuitabilityGrade, strategy: StrategyKey) {
  if (strategy === "all") return true;
  if (strategy === "suitability_a") return grade === "A";
  return grade === "A" || grade === "B";
}

export function evaluateStrategy(
  races: Array<{ grade: SuitabilityGrade; isDataSufficient: boolean; investment: number; returnAmount: number }>,
  strategy: StrategyKey,
): StrategyPerformance {
  const selected = races.filter((race) => strategy === "all" || (race.isDataSufficient && isEligibleForStrategy(race.grade, strategy)));
  const investment = selected.reduce((sum, race) => sum + race.investment, 0);
  const returnAmount = selected.reduce((sum, race) => sum + race.returnAmount, 0);
  const labels: Record<StrategyKey, string> = { all: "全対象レース", suitability_a: "AI適性 A", suitability_ab: "AI適性 A・B" };
  return {
    key: strategy,
    label: labels[strategy],
    purchaseRaceCount: selected.length,
    skippedRaceCount: races.length - selected.length,
    ...calculatePerformance(investment, returnAmount),
  };
}

export function recommendationLabel(decision: PurchaseDecision) {
  return decision === "buy" ? "購入候補" : "見送り";
}

export function assertNoSuitabilityDataLeak(snapshot: SuitabilitySnapshot, raceStartAt: string) {
  if (new Date(snapshot.dataCutoffAt).getTime() >= new Date(raceStartAt).getTime()) {
    throw new Error("適性判定の参照データはレース開始前に確定している必要があります");
  }
  if (new Date(snapshot.calculatedAt).getTime() >= new Date(raceStartAt).getTime()) {
    throw new Error("適性判定はレース開始前に確定している必要があります");
  }
}
