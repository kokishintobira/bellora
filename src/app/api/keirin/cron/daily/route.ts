import { NextRequest, NextResponse } from "next/server";
import { getKeirinDb, isKeirinDbConfigured } from "@/lib/keirin/db";

function yesterdayInTokyo() {
  const now = new Date();
  const tokyo = new Date(now.toLocaleString("en-US", { timeZone: "Asia/Tokyo" }));
  tokyo.setDate(tokyo.getDate() - 1);
  return `${tokyo.getFullYear()}-${String(tokyo.getMonth() + 1).padStart(2, "0")}-${String(tokyo.getDate()).padStart(2, "0")}`;
}

export async function GET(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isKeirinDbConfigured()) return NextResponse.json({ error: "Turso is not configured" }, { status: 503 });

  const resultDate = yesterdayInTokyo();
  const db = getKeirinDb();
  const aggregate = await db.execute({
    sql: `SELECT COUNT(DISTINCT r.id) AS race_count,
      COUNT(sr.id) AS bet_count,
      COALESCE(SUM(sr.investment), 0) AS investment,
      COALESCE(SUM(sr.return_amount), 0) AS return_amount
      FROM races r LEFT JOIN simulation_results sr ON sr.race_id = r.id
      WHERE r.race_date = ?`,
    args: [resultDate],
  });
  const row = aggregate.rows[0];
  const investment = Number(row.investment ?? 0);
  const returnAmount = Number(row.return_amount ?? 0);
  const profit = returnAmount - investment;
  const roi = investment === 0 ? null : (returnAmount / investment) * 100;

  await db.execute({
    sql: `INSERT INTO daily_results (id, result_date, race_count, bet_count, investment, return_amount, profit, roi, status)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'confirmed')
      ON CONFLICT(result_date) DO UPDATE SET race_count = excluded.race_count, bet_count = excluded.bet_count,
      investment = excluded.investment, return_amount = excluded.return_amount, profit = excluded.profit,
      roi = excluded.roi, status = 'confirmed', updated_at = CURRENT_TIMESTAMP`,
    args: [`daily:${resultDate}`, resultDate, Number(row.race_count ?? 0), Number(row.bet_count ?? 0), investment, returnAmount, profit, roi],
  });

  // 全レースとAI適性A・B戦略をレース単位で保存する。見送りでも仮想成績は残す。
  await db.batch([
    {
      sql: `INSERT INTO simulation_strategy_results
        (id, simulation_result_id, strategy_key, decision, hypothetical_investment, hypothetical_return_amount, strategy_investment, strategy_return_amount, is_hypothetical_hit)
        SELECT 'strategy:all:' || sr.id, sr.id, 'all', 'buy', sr.investment, sr.return_amount, sr.investment, sr.return_amount, sr.is_hit
        FROM simulation_results sr JOIN races r ON r.id = sr.race_id WHERE r.race_date = ?
        ON CONFLICT(simulation_result_id, strategy_key) DO UPDATE SET
        decision = excluded.decision, hypothetical_investment = excluded.hypothetical_investment,
        hypothetical_return_amount = excluded.hypothetical_return_amount, strategy_investment = excluded.strategy_investment,
        strategy_return_amount = excluded.strategy_return_amount, is_hypothetical_hit = excluded.is_hypothetical_hit,
        updated_at = CURRENT_TIMESTAMP`,
      args: [resultDate],
    },
    {
      sql: `INSERT INTO simulation_strategy_results
        (id, simulation_result_id, strategy_key, decision, hypothetical_investment, hypothetical_return_amount, strategy_investment, strategy_return_amount, is_hypothetical_hit)
        SELECT 'strategy:ab:' || sr.id, sr.id, 'suitability_ab',
        CASE WHEN ps.grade IN ('A','B') AND ps.is_data_sufficient = 1 THEN 'buy' ELSE 'skip' END,
        sr.investment, sr.return_amount,
        CASE WHEN ps.grade IN ('A','B') AND ps.is_data_sufficient = 1 THEN sr.investment ELSE 0 END,
        CASE WHEN ps.grade IN ('A','B') AND ps.is_data_sufficient = 1 THEN sr.return_amount ELSE 0 END,
        sr.is_hit
        FROM simulation_results sr JOIN races r ON r.id = sr.race_id
        LEFT JOIN prediction_suitability ps ON ps.prediction_id = sr.prediction_id
        WHERE r.race_date = ?
        ON CONFLICT(simulation_result_id, strategy_key) DO UPDATE SET
        decision = excluded.decision, hypothetical_investment = excluded.hypothetical_investment,
        hypothetical_return_amount = excluded.hypothetical_return_amount, strategy_investment = excluded.strategy_investment,
        strategy_return_amount = excluded.strategy_return_amount, is_hypothetical_hit = excluded.is_hypothetical_hit,
        updated_at = CURRENT_TIMESTAMP`,
      args: [resultDate],
    },
  ], "write");

  const strategyAggregate = await db.execute({
    sql: `SELECT ssr.strategy_key,
      SUM(CASE WHEN ssr.decision = 'buy' THEN 1 ELSE 0 END) AS purchase_race_count,
      SUM(CASE WHEN ssr.decision = 'skip' THEN 1 ELSE 0 END) AS skipped_race_count,
      COALESCE(SUM(ssr.strategy_investment), 0) AS investment,
      COALESCE(SUM(ssr.strategy_return_amount), 0) AS return_amount
      FROM simulation_strategy_results ssr
      JOIN simulation_results sr ON sr.id = ssr.simulation_result_id
      JOIN races r ON r.id = sr.race_id
      WHERE r.race_date = ? GROUP BY ssr.strategy_key`,
    args: [resultDate],
  });

  for (const strategy of strategyAggregate.rows) {
    const strategyInvestment = Number(strategy.investment ?? 0);
    const strategyReturn = Number(strategy.return_amount ?? 0);
    const strategyProfit = strategyReturn - strategyInvestment;
    const strategyRoi = strategyInvestment === 0 ? null : (strategyReturn / strategyInvestment) * 100;
    const strategyKey = String(strategy.strategy_key);
    await db.execute({
      sql: `INSERT INTO daily_strategy_results
        (id, result_date, strategy_key, purchase_race_count, skipped_race_count, investment, return_amount, profit, roi)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(result_date, strategy_key) DO UPDATE SET purchase_race_count = excluded.purchase_race_count,
        skipped_race_count = excluded.skipped_race_count, investment = excluded.investment,
        return_amount = excluded.return_amount, profit = excluded.profit, roi = excluded.roi,
        updated_at = CURRENT_TIMESTAMP`,
      args: [`daily-strategy:${resultDate}:${strategyKey}`, resultDate, strategyKey,
        Number(strategy.purchase_race_count ?? 0), Number(strategy.skipped_race_count ?? 0),
        strategyInvestment, strategyReturn, strategyProfit, strategyRoi],
    });
  }

  return NextResponse.json({ ok: true, resultDate, investment, returnAmount, profit, roi, strategies: strategyAggregate.rows });
}
