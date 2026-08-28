export type Performance = {
  investment: number;
  returnAmount: number;
  profit: number;
  roi: number | null;
};

export type SuitabilityGrade = "A" | "B" | "C" | "D";
export type PurchaseDecision = "buy" | "skip";
export type StrategyKey = "all" | "suitability_a" | "suitability_ab";

export type SuitabilitySnapshot = {
  grade: SuitabilityGrade;
  similarRaceCount: number;
  historicalRoi: number;
  historicalHitRate: number;
  isDataSufficient: boolean;
  recommendation: PurchaseDecision;
  ruleVersion: string;
  calculatedAt: string;
  dataCutoffAt: string;
};

export type StrategyPerformance = Performance & {
  key: StrategyKey;
  label: string;
  purchaseRaceCount: number;
  skippedRaceCount: number;
};

export type RacePrediction = {
  id: string;
  date: string;
  venue: string;
  raceNumber: number;
  startTime: string;
  status: "scheduled" | "confirmed";
  confidence: "高" | "中" | "低";
  suitability: SuitabilitySnapshot;
  bets: Array<{
    combination: string;
    amount: number;
    odds: number;
    expectedValue: number;
  }>;
  result?: string;
  payout?: number;
};

export type DailyResult = Performance & {
  id: string;
  date: string;
  raceCount: number;
  betCount: number;
  strategies: StrategyPerformance[];
  races: Array<{
    id: string;
    venue: string;
    raceNumber: number;
    prediction: string;
    result: string;
    investment: number;
    returnAmount: number;
    isHit: boolean;
    suitabilityGrade: SuitabilityGrade;
    selectedBySuitability: boolean;
  }>;
};

export type Experiment = Performance & {
  id: string;
  name: string;
  model: string;
  version: string;
  period: string;
  raceCount: number;
  status: "完了" | "比較中";
  features: string[];
  strategies: StrategyPerformance[];
};
