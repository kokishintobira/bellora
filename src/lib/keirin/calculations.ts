import type { DailyResult, Performance, RacePrediction } from "./types";

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
