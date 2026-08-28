import { NextResponse } from "next/server";
import { getKeirinDb, isKeirinDbConfigured } from "@/lib/keirin/db";
import type { DailyResult, Experiment, KeirinDashboardData, StrategyPerformance } from "@/lib/keirin/types";

const number = (value: unknown) => Number(value ?? 0);
const performance = (investment: number, returnAmount: number) => ({
  investment, returnAmount, profit: returnAmount - investment,
  roi: investment ? returnAmount / investment * 100 : null,
});
const strategyLabel = (key: string) => key === "all" ? "全対象レース" : key === "suitability_a" ? "AI適性 A" : "AI適性 A・B";

export async function GET() {
  if (!isKeirinDbConfigured()) {
    return NextResponse.json({ error: "実データDBが未設定です。Turso環境変数を設定してください。" }, { status: 503 });
  }
  const db = getKeirinDb();
  const latest = await db.execute(`SELECT MAX(r.race_date) AS race_date FROM races r JOIN predictions p ON p.race_id=r.id`);
  const latestDate = String(latest.rows[0]?.race_date ?? "");
  const predictionRows = latestDate ? await db.execute({
    sql: `SELECT r.id, r.race_date, r.venue, r.race_number, r.status, rm.start_time,
      p.predicted_first, p.predicted_second, p.odds, p.expected_value, p.estimated_probability,
      b.bet_amount, ps.grade, ps.similar_race_count, ps.historical_roi, ps.historical_hit_rate,
      ps.is_data_sufficient, ps.recommendation, ps.rule_version, ps.calculated_at, ps.data_cutoff_at
      FROM races r JOIN predictions p ON p.race_id=r.id
      JOIN bets b ON b.prediction_id=p.id
      JOIN prediction_suitability ps ON ps.prediction_id=p.id
      LEFT JOIN race_metadata rm ON rm.race_id=r.id
      WHERE r.race_date=?
      AND p.id=(SELECT p2.id FROM predictions p2 WHERE p2.race_id=r.id
        ORDER BY p2.created_at DESC,p2.id DESC LIMIT 1)
      ORDER BY r.venue, r.race_number`,
    args: [latestDate],
  }) : { rows: [] };
  const todayPredictions = predictionRows.rows.map((row) => ({
    id: String(row.id), date: String(row.race_date), venue: String(row.venue), raceNumber: number(row.race_number),
    startTime: String(row.start_time ?? "--:--"), status: row.status === "confirmed" ? "confirmed" as const : "scheduled" as const,
    confidence: number(row.estimated_probability) >= .3 ? "高" as const : number(row.estimated_probability) >= .18 ? "中" as const : "低" as const,
    suitability: { grade: String(row.grade) as "A"|"B"|"C"|"D", similarRaceCount: number(row.similar_race_count),
      historicalRoi: number(row.historical_roi), historicalHitRate: number(row.historical_hit_rate),
      isDataSufficient: Boolean(row.is_data_sufficient), recommendation: String(row.recommendation) as "buy"|"skip",
      ruleVersion: String(row.rule_version), calculatedAt: String(row.calculated_at), dataCutoffAt: String(row.data_cutoff_at) },
    bets: [{ combination: `${row.predicted_first}–${row.predicted_second}`, amount: number(row.bet_amount),
      odds: number(row.odds), expectedValue: number(row.expected_value) }],
  }));

  const dailyRows = await db.execute(`SELECT * FROM daily_results WHERE status='confirmed' ORDER BY result_date DESC LIMIT 90`);
  const dailyResults: DailyResult[] = [];
  for (const day of dailyRows.rows) {
    const [strategyRows, raceRows] = await Promise.all([
      db.execute({ sql: `SELECT * FROM daily_strategy_results WHERE result_date=? ORDER BY strategy_key`, args: [day.result_date] }),
      db.execute({ sql: `SELECT r.id,r.venue,r.race_number,p.predicted_first,p.predicted_second,
        rr.first_number,rr.second_number,sr.investment,sr.return_amount,sr.is_hit,ps.grade,
        CASE WHEN ps.grade IN ('A','B') AND ps.is_data_sufficient=1 THEN 1 ELSE 0 END AS selected
        FROM races r JOIN predictions p ON p.race_id=r.id JOIN race_results rr ON rr.race_id=r.id
        JOIN simulation_results sr ON sr.prediction_id=p.id JOIN prediction_suitability ps ON ps.prediction_id=p.id
        WHERE r.race_date=?
        AND p.id=(SELECT p2.id FROM predictions p2 WHERE p2.race_id=r.id
          ORDER BY p2.created_at DESC,p2.id DESC LIMIT 1)
        ORDER BY r.venue,r.race_number`, args: [day.result_date] }),
    ]);
    const strategies: StrategyPerformance[] = strategyRows.rows.map((row) => ({
      key: String(row.strategy_key) as StrategyPerformance["key"], label: strategyLabel(String(row.strategy_key)),
      purchaseRaceCount: number(row.purchase_race_count), skippedRaceCount: number(row.skipped_race_count),
      ...performance(number(row.investment), number(row.return_amount)),
    }));
    dailyResults.push({ id: String(day.id), date: String(day.result_date), raceCount: number(day.race_count),
      betCount: number(day.bet_count), ...performance(number(day.investment), number(day.return_amount)), strategies,
      races: raceRows.rows.map((row) => ({ id: String(row.id), venue: String(row.venue), raceNumber: number(row.race_number),
        prediction: `${row.predicted_first}–${row.predicted_second}`, result: `${row.first_number}–${row.second_number}`,
        investment: number(row.investment), returnAmount: number(row.return_amount), isHit: Boolean(row.is_hit),
        suitabilityGrade: String(row.grade) as "A"|"B"|"C"|"D", selectedBySuitability: Boolean(row.selected) })) });
  }

  const experimentRows = await db.execute(`SELECT e.*,m.name AS model_name,m.version FROM experiments e JOIN models m ON m.id=e.model_id ORDER BY e.created_at DESC LIMIT 20`);
  const experimentStrategyRows = await db.execute(`SELECT * FROM experiment_strategy_results ORDER BY strategy_key`);
  const experiments: Experiment[] = experimentRows.rows.map((row) => ({
    id: String(row.id), name: String(row.name), model: String(row.model_name), version: String(row.version),
    period: String(row.name).replace("時系列バックテスト ", ""), raceCount: number(row.race_count), status: "完了" as const,
    ...performance(number(row.investment), number(row.return_amount)), features: ["競走得点", "勝率・連対率", "脚質", "車立て", "競輪場", "モデルconfidence"],
    strategies: experimentStrategyRows.rows.filter((strategy) => strategy.experiment_id === row.id).map((strategy) => ({
      key: String(strategy.strategy_key) as StrategyPerformance["key"], label: strategyLabel(String(strategy.strategy_key)),
      purchaseRaceCount: number(strategy.purchase_race_count), skippedRaceCount: number(strategy.skipped_race_count),
      ...performance(number(strategy.investment), number(strategy.return_amount)),
    })),
  }));
  const sum = (rows: DailyResult[]) => rows.reduce((acc, row) => ({ investment: acc.investment + row.investment, returnAmount: acc.returnAmount + row.returnAmount }), { investment: 0, returnAmount: 0 });
  const all = sum(dailyResults);
  const monthKey = latestDate.slice(0, 7);
  const month = sum(dailyResults.filter((row) => row.date.startsWith(monthKey)));
  const response: KeirinDashboardData = { dataMode: "real", generatedAt: new Date().toISOString(), todayPredictions,
    dailyResults, experiments, monthPerformance: performance(month.investment, month.returnAmount),
    allTimePerformance: performance(all.investment, all.returnAmount) };
  return NextResponse.json(response, { headers: { "Cache-Control": "private, max-age=30" } });
}
