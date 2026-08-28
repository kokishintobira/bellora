import { aggregateDailyResults, calculatePerformance } from "./calculations";
import { assessSuitability } from "./suitability";
import type { DailyResult, Experiment, RacePrediction, StrategyPerformance, SuitabilityGrade } from "./types";

const suitability = (similarRaceCount: number, historicalRoi: number, historicalHitRate: number) =>
  assessSuitability({
    similarRaceCount,
    historicalRoi,
    historicalHitRate,
    calculatedAt: "2026-08-28T08:00:00+09:00",
    dataCutoffAt: "2026-08-27T23:59:59+09:00",
  });

const strategies = (
  allInvestment: number,
  allReturn: number,
  totalRaces: number,
  selectedInvestment: number,
  selectedReturn: number,
  selectedRaces: number,
): StrategyPerformance[] => [
  { key: "all", label: "全対象レース", purchaseRaceCount: totalRaces, skippedRaceCount: 0, ...calculatePerformance(allInvestment, allReturn) },
  { key: "suitability_a", label: "AI適性 A", purchaseRaceCount: Math.round(selectedRaces * .6), skippedRaceCount: totalRaces - Math.round(selectedRaces * .6), ...calculatePerformance(Math.round(selectedInvestment * .6), Math.round(selectedReturn * .7)) },
  { key: "suitability_ab", label: "AI適性 A・B", purchaseRaceCount: selectedRaces, skippedRaceCount: totalRaces - selectedRaces, ...calculatePerformance(selectedInvestment, selectedReturn) },
];

export const todayPredictions: RacePrediction[] = [
  {
    id: "race-20260828-kawasaki-8",
    date: "2026-08-28",
    venue: "川崎",
    raceNumber: 8,
    startTime: "18:24",
    status: "scheduled",
    confidence: "高",
    suitability: suitability(428, 118.7, 24.1),
    bets: [
      { combination: "7–3", amount: 500, odds: 6.2, expectedValue: 1.32 },
      { combination: "7–5", amount: 300, odds: 9.8, expectedValue: 1.18 },
      { combination: "7–1", amount: 200, odds: 14.6, expectedValue: 1.09 },
    ],
  },
  {
    id: "race-20260828-kawasaki-9",
    date: "2026-08-28",
    venue: "川崎",
    raceNumber: 9,
    startTime: "18:52",
    status: "scheduled",
    confidence: "中",
    suitability: suitability(312, 107.6, 21.8),
    bets: [
      { combination: "3–1", amount: 500, odds: 4.8, expectedValue: 1.21 },
      { combination: "3–7", amount: 500, odds: 7.3, expectedValue: 1.04 },
    ],
  },
  {
    id: "race-20260828-toyama-11",
    date: "2026-08-28",
    venue: "富山",
    raceNumber: 11,
    startTime: "15:52",
    status: "scheduled",
    confidence: "高",
    suitability: suitability(32, 129.4, 28.1),
    bets: [
      { combination: "2–5", amount: 500, odds: 8.4, expectedValue: 1.41 },
      { combination: "2–1", amount: 500, odds: 5.1, expectedValue: 1.12 },
    ],
  },
  {
    id: "race-20260828-matsusaka-10",
    date: "2026-08-28",
    venue: "松阪",
    raceNumber: 10,
    startTime: "19:31",
    status: "scheduled",
    confidence: "中",
    suitability: suitability(311, 71.4, 14.7),
    bets: [
      { combination: "5–2", amount: 500, odds: 5.7, expectedValue: 1.16 },
    ],
  },
];

const race = (
  id: string,
  venue: string,
  raceNumber: number,
  prediction: string,
  result: string,
  investment: number,
  returnAmount: number,
  suitabilityGrade: SuitabilityGrade = "B",
  selectedBySuitability = true,
) => ({
  id,
  venue,
  raceNumber,
  prediction,
  result,
  investment,
  returnAmount,
  isHit: prediction === result,
  suitabilityGrade,
  selectedBySuitability,
});

export const dailyResults: DailyResult[] = [
  {
    id: "daily-20260827",
    date: "2026-08-27",
    raceCount: 42,
    betCount: 11,
    strategies: strategies(11000, 13200, 11, 6000, 10200, 6),
    ...calculatePerformance(11000, 13200),
    races: [
      race("r-827-1", "川崎", 8, "7–3", "7–5", 1000, 0, "A", true),
      race("r-827-2", "川崎", 9, "3–1", "3–1", 1000, 4800, "B", true),
      race("r-827-3", "富山", 10, "2–5", "2–5", 1000, 8400, "C", false),
      race("r-827-4", "松阪", 7, "5–2", "1–5", 1000, 0, "D", false),
    ],
  },
  {
    id: "daily-20260826",
    date: "2026-08-26",
    raceCount: 38,
    betCount: 9,
    strategies: strategies(9000, 7200, 9, 5000, 7200, 5),
    ...calculatePerformance(9000, 7200),
    races: [
      race("r-826-1", "岸和田", 6, "1–4", "1–4", 1000, 7200),
      race("r-826-2", "岸和田", 9, "6–2", "2–6", 1000, 0, "C", false),
      race("r-826-3", "立川", 11, "3–7", "3–5", 1000, 0, "D", false),
    ],
  },
  {
    id: "daily-20260825",
    date: "2026-08-25",
    raceCount: 45,
    betCount: 12,
    strategies: strategies(12000, 15840, 12, 7000, 15840, 7),
    ...calculatePerformance(12000, 15840),
    races: [
      race("r-825-1", "青森", 9, "4–1", "4–1", 1000, 6840),
      race("r-825-2", "青森", 12, "2–7", "2–7", 1000, 9000),
      race("r-825-3", "小倉", 8, "5–3", "5–1", 1000, 0, "D", false),
    ],
  },
  {
    id: "daily-20260824",
    date: "2026-08-24",
    raceCount: 36,
    betCount: 8,
    strategies: strategies(8000, 9600, 8, 4000, 9600, 4),
    ...calculatePerformance(8000, 9600),
    races: [race("r-824-1", "函館", 10, "3–5", "3–5", 1000, 9600)],
  },
  {
    id: "daily-20260823",
    date: "2026-08-23",
    raceCount: 40,
    betCount: 10,
    strategies: strategies(10000, 6100, 10, 6000, 6100, 6),
    ...calculatePerformance(10000, 6100),
    races: [race("r-823-1", "伊東", 9, "7–1", "7–4", 1000, 0)],
  },
  {
    id: "daily-20260822",
    date: "2026-08-22",
    raceCount: 41,
    betCount: 10,
    strategies: strategies(10000, 11800, 10, 5000, 11800, 5),
    ...calculatePerformance(10000, 11800),
    races: [race("r-822-1", "平塚", 8, "2–6", "2–6", 1000, 11800)],
  },
  {
    id: "daily-20260821",
    date: "2026-08-21",
    raceCount: 35,
    betCount: 7,
    strategies: strategies(7000, 4900, 7, 4000, 4900, 4),
    ...calculatePerformance(7000, 4900),
    races: [race("r-821-1", "大宮", 7, "1–5", "3–5", 1000, 0)],
  },
];

export const monthPerformance = {
  investment: 125000,
  returnAmount: 142600,
  profit: 17600,
  roi: 114.08,
};

export const allTimePerformance = {
  investment: 684000,
  returnAmount: 731880,
  profit: 47880,
  roi: 107,
};

export const recentPerformance = aggregateDailyResults(dailyResults);

export const experiments: Experiment[] = [
  {
    id: "experiment-21",
    name: "Experiment #21",
    model: "LightGBM Ranker",
    version: "v1.8.2",
    period: "2026/01/01 — 2026/06/30",
    raceCount: 1842,
    status: "完了",
    investment: 325000,
    returnAmount: 351200,
    profit: 26200,
    roi: 108.06,
    features: ["直近5走", "競走得点", "ライン構成", "バンク相性", "天候・風速"],
    strategies: strategies(500000, 485000, 1000, 180000, 207000, 360),
  },
  {
    id: "experiment-20",
    name: "Experiment #20",
    model: "LightGBM Ranker",
    version: "v1.8.1",
    period: "2025/10/01 — 2026/03/31",
    raceCount: 1764,
    status: "比較中",
    investment: 298000,
    returnAmount: 286080,
    profit: -11920,
    roi: 96,
    features: ["直近3走", "競走得点", "ライン構成", "脚質"],
    strategies: strategies(420000, 399000, 840, 168000, 176400, 336),
  },
];
