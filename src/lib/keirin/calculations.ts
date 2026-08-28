import type { DailyResult, Performance, RacePrediction, StrategyKey, StrategyPerformance } from "./types";

export const STRATEGY_KEYS: StrategyKey[] = ["suitability_a", "suitability_ab", "all"];

export const STRATEGY_LABELS: Record<StrategyKey, string> = {
  all: "全対象レース",
  suitability_a: "AI適性 A",
  suitability_ab: "AI適性 A・B",
};

export function isStrategyKey(value: string | null): value is StrategyKey {
  return value === "all" || value === "suitability_a" || value === "suitability_ab";
}

export function calculatePerformance(
  investment: number,
  returnAmount: number,
): Performance {
  return {
    investment,
    returnAmount,
    profit: returnAmount - investment,
    roi: investment === 0 ? null : (returnAmount / investment) * 100,
  };
}

export function scaleMoney(amount: number, baseStake: number, originalStake = 500) {
  return Math.round((amount * baseStake) / originalStake);
}

export function scalePerformance(
  performance: Performance,
  baseStake: number,
  originalStake = 500,
): Performance {
  return calculatePerformance(
    scaleMoney(performance.investment, baseStake, originalStake),
    scaleMoney(performance.returnAmount, baseStake, originalStake),
  );
}

export function aggregateDailyResults(results: DailyResult[]): Performance {
  return results.reduce(
    (total, result) =>
      calculatePerformance(
        total.investment + result.investment,
        total.returnAmount + result.returnAmount,
      ),
    calculatePerformance(0, 0),
  );
}

export function performanceForStrategy(result: DailyResult, strategyKey: StrategyKey): StrategyPerformance {
  const saved = result.strategies.find((strategy) => strategy.key === strategyKey);
  if (saved) return saved;
  if (strategyKey === "all") {
    return {
      key: strategyKey,
      label: STRATEGY_LABELS[strategyKey],
      purchaseRaceCount: result.betCount,
      skippedRaceCount: Math.max(0, result.raceCount - result.betCount),
      investment: result.investment,
      returnAmount: result.returnAmount,
      profit: result.profit,
      roi: result.roi,
    };
  }
  return {
    key: strategyKey,
    label: STRATEGY_LABELS[strategyKey],
    purchaseRaceCount: 0,
    skippedRaceCount: result.raceCount,
    ...calculatePerformance(0, 0),
  };
}

export function aggregateStrategyResults(results: DailyResult[], strategyKey: StrategyKey): StrategyPerformance {
  return results.reduce<StrategyPerformance>((total, result) => {
    const strategy = performanceForStrategy(result, strategyKey);
    return {
      key: strategyKey,
      label: STRATEGY_LABELS[strategyKey],
      purchaseRaceCount: total.purchaseRaceCount + strategy.purchaseRaceCount,
      skippedRaceCount: total.skippedRaceCount + strategy.skippedRaceCount,
      ...calculatePerformance(
        total.investment + strategy.investment,
        total.returnAmount + strategy.returnAmount,
      ),
    };
  }, {
    key: strategyKey,
    label: STRATEGY_LABELS[strategyKey],
    purchaseRaceCount: 0,
    skippedRaceCount: 0,
    ...calculatePerformance(0, 0),
  });
}

export function dailyResultForStrategy(result: DailyResult, strategyKey: StrategyKey): DailyResult {
  const strategy = performanceForStrategy(result, strategyKey);
  return {
    ...result,
    betCount: strategy.purchaseRaceCount,
    investment: strategy.investment,
    returnAmount: strategy.returnAmount,
    profit: strategy.profit,
    roi: strategy.roi,
  };
}

export function calculatePredictionTotal(prediction: RacePrediction) {
  const investment = prediction.bets.reduce((sum, bet) => sum + bet.amount, 0);
  const topReturn = prediction.bets.reduce(
    (max, bet) => Math.max(max, bet.amount * bet.odds),
    0,
  );
  return calculatePerformance(investment, prediction.payout ?? topReturn);
}

export function formatYen(value: number, withSign = false) {
  const rounded = Math.round(value);
  const sign = withSign && rounded > 0 ? "+" : "";
  return `${sign}${rounded.toLocaleString("ja-JP")}円`;
}

export function formatRoi(value: number | null, digits = 1) {
  return value === null ? "—" : `${value.toFixed(digits)}%`;
}
