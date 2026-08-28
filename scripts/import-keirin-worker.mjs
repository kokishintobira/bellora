import { createClient } from "@libsql/client";
import { readFile } from "node:fs/promises";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;
if (!url || !authToken) throw new Error("TURSO_DATABASE_URL と TURSO_AUTH_TOKEN を設定してください");
const db = createClient({ url, authToken });
const input = process.argv[2] ?? "worker/out/today.json";
const payload = JSON.parse(await readFile(input, "utf8"));
const stake = Number(process.env.KEIRIN_BASE_STAKE ?? 100);
const modelId = `model:${payload.model_version}`;
const completedDates = new Set();

await db.execute({
  sql: `INSERT INTO models (id, name, version, description) VALUES (?, 'LightGBM two-stage classifier', ?, ?)
    ON CONFLICT(id) DO UPDATE SET description = excluded.description`,
  args: [modelId, payload.model_version, `公式公開データ・cutoff=${payload.model_data_cutoff_at ?? payload.data_cutoff_at}`],
});
await db.execute({ sql: `INSERT INTO model_runs
    (model_id,data_cutoff_at,training_race_count,validation_race_count,feature_columns_json,source)
    VALUES (?,?,?,?,?,'keirin.jp') ON CONFLICT(model_id) DO UPDATE SET
    data_cutoff_at=excluded.data_cutoff_at,training_race_count=excluded.training_race_count,
    validation_race_count=excluded.validation_race_count,feature_columns_json=excluded.feature_columns_json`,
  args: [modelId, payload.model_data_cutoff_at ?? payload.data_cutoff_at,
    payload.training_race_count ?? null, payload.validation_race_count ?? null,
    JSON.stringify(payload.feature_columns ?? [])] });

const races = payload.races ?? [];
for (const race of races) {
  const raceId = race.race_key;
  const predictionId = `prediction:${raceId}:${payload.model_version}`;
  await db.batch([
    { sql: `INSERT INTO races (id, race_date, venue, race_number, status) VALUES (?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET venue=excluded.venue, status=excluded.status, updated_at=CURRENT_TIMESTAMP`,
      args: [raceId, race.race_date, race.venue, race.race_number, race.actual_first ? "confirmed" : "scheduled"] },
    { sql: `INSERT INTO race_metadata (race_id, venue_code, grade, race_name, start_time, field_size, source, collected_at)
        VALUES (?, ?, ?, ?, ?, ?, 'keirin.jp', ?)
        ON CONFLICT(race_id) DO UPDATE SET grade=excluded.grade, race_name=excluded.race_name,
        start_time=excluded.start_time, field_size=excluded.field_size, collected_at=excluded.collected_at, updated_at=CURRENT_TIMESTAMP`,
      args: [raceId, race.venue_code, race.grade, race.race_name, race.start_time, race.field_size, payload.generated_at] },
    { sql: `INSERT INTO predictions (id, race_id, model_id, predicted_first, predicted_second, odds, estimated_probability, expected_value)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(id) DO UPDATE SET odds=excluded.odds, estimated_probability=excluded.estimated_probability,
        expected_value=excluded.expected_value`,
      args: [predictionId, raceId, modelId, race.predicted_first, race.predicted_second, race.odds || null,
        race.probability_first, race.expected_value] },
    { sql: `INSERT INTO bets (id, prediction_id, bet_type, first_number, second_number, bet_amount)
        VALUES (?, ?, '2t', ?, ?, ?) ON CONFLICT(id) DO UPDATE SET bet_amount=excluded.bet_amount`,
      args: [`bet:${predictionId}`, predictionId, race.predicted_first, race.predicted_second, stake] },
    { sql: `INSERT INTO prediction_suitability
        (id, prediction_id, grade, similar_race_count, historical_roi, historical_hit_rate, is_data_sufficient,
         recommendation, rule_version, feature_snapshot_json, data_cutoff_at, calculated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        ON CONFLICT(prediction_id) DO UPDATE SET grade=excluded.grade, similar_race_count=excluded.similar_race_count,
        historical_roi=excluded.historical_roi, historical_hit_rate=excluded.historical_hit_rate,
        is_data_sufficient=excluded.is_data_sufficient, recommendation=excluded.recommendation,
        feature_snapshot_json=excluded.feature_snapshot_json`,
      args: [`suitability:${predictionId}`, predictionId, race.suitability.grade, race.suitability.similar_race_count,
        race.suitability.historical_roi, race.suitability.historical_hit_rate, race.suitability.is_data_sufficient ? 1 : 0,
        race.suitability.recommendation, race.suitability.rule_version, JSON.stringify({
          conditionKey: race.suitability.condition_key, confidenceBand: race.confidence_band,
          fieldSize: race.field_size, grade: race.grade,
        }), payload.suitability_data_cutoff_at ?? payload.model_data_cutoff_at ?? payload.data_cutoff_at,
        race.prediction_created_at ?? payload.generated_at] },
  ], "write");

  if (race.actual_first) {
    completedDates.add(race.race_date);
    const hit = race.predicted_first === race.actual_first && race.predicted_second === race.actual_second;
    const returned = hit ? Number(race.payout_2t ?? 0) * (stake / 100) : 0;
    await db.batch([
      { sql: `INSERT INTO race_results (id, race_id, first_number, second_number, payout) VALUES (?, ?, ?, ?, ?)
          ON CONFLICT(race_id) DO UPDATE SET first_number=excluded.first_number, second_number=excluded.second_number, payout=excluded.payout`,
        args: [`result:${raceId}`, raceId, race.actual_first, race.actual_second, race.payout_2t] },
      { sql: `INSERT INTO simulation_results (id, race_id, prediction_id, investment, return_amount, profit, roi, is_hit)
          VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(prediction_id) DO UPDATE SET return_amount=excluded.return_amount,
          profit=excluded.profit, roi=excluded.roi, is_hit=excluded.is_hit`,
        args: [`simulation:${predictionId}`, raceId, predictionId, stake, returned, returned - stake,
          returned / stake * 100, hit ? 1 : 0] },
    ], "write");
  }
}

for (const resultDate of completedDates) {
  const aggregate = await db.execute({ sql: `SELECT COUNT(*) AS race_count, COALESCE(SUM(sr.investment),0) AS investment,
      COALESCE(SUM(sr.return_amount),0) AS return_amount FROM races r
      JOIN simulation_results sr ON sr.race_id=r.id WHERE r.race_date=?`, args: [resultDate] });
  const total = aggregate.rows[0];
  const investment = Number(total.investment), returnAmount = Number(total.return_amount);
  await db.execute({ sql: `INSERT INTO daily_results
      (id,result_date,race_count,bet_count,investment,return_amount,profit,roi,status)
      VALUES (?,?,?,?,?,?,?,?, 'confirmed') ON CONFLICT(result_date) DO UPDATE SET race_count=excluded.race_count,
      bet_count=excluded.bet_count,investment=excluded.investment,return_amount=excluded.return_amount,
      profit=excluded.profit,roi=excluded.roi,status='confirmed',updated_at=CURRENT_TIMESTAMP`,
    args: [`daily:${resultDate}`, resultDate, Number(total.race_count), Number(total.race_count), investment,
      returnAmount, returnAmount - investment, investment ? returnAmount / investment * 100 : null] });
  for (const strategyKey of ["all", "suitability_a", "suitability_ab"]) {
    const selectedGrades = strategyKey === "suitability_a" ? "('A')" : "('A','B')";
    const selection = strategyKey === "all" ? "1=1" : `ps.grade IN ${selectedGrades} AND ps.is_data_sufficient=1`;
    const strategy = await db.execute({ sql: `SELECT
        SUM(CASE WHEN ${selection} THEN 1 ELSE 0 END) AS purchases,
        SUM(CASE WHEN ${selection} THEN 0 ELSE 1 END) AS skips,
        COALESCE(SUM(CASE WHEN ${selection} THEN sr.investment ELSE 0 END),0) AS investment,
        COALESCE(SUM(CASE WHEN ${selection} THEN sr.return_amount ELSE 0 END),0) AS return_amount
        FROM races r JOIN simulation_results sr ON sr.race_id=r.id
        JOIN prediction_suitability ps ON ps.prediction_id=sr.prediction_id WHERE r.race_date=?`, args: [resultDate] });
    const row = strategy.rows[0], strategyInvestment = Number(row.investment), strategyReturn = Number(row.return_amount);
    await db.execute({ sql: `INSERT INTO daily_strategy_results
        (id,result_date,strategy_key,purchase_race_count,skipped_race_count,investment,return_amount,profit,roi)
        VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(result_date,strategy_key) DO UPDATE SET
        purchase_race_count=excluded.purchase_race_count,skipped_race_count=excluded.skipped_race_count,
        investment=excluded.investment,return_amount=excluded.return_amount,profit=excluded.profit,
        roi=excluded.roi,updated_at=CURRENT_TIMESTAMP`, args: [`daily-strategy:${resultDate}:${strategyKey}`,
        resultDate, strategyKey, Number(row.purchases), Number(row.skips), strategyInvestment, strategyReturn,
        strategyReturn - strategyInvestment, strategyInvestment ? strategyReturn / strategyInvestment * 100 : null] });
  }
}

if (payload.strategies) {
  const experimentId = `experiment:${payload.model_version}:${payload.period.from}:${payload.period.to}`;
  const all = payload.strategies.find((row) => row.strategy_key === "all");
  await db.execute({ sql: `INSERT INTO experiments
      (id, model_id, name, investment, return_amount, profit, roi, race_count)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET return_amount=excluded.return_amount,
      profit=excluded.profit, roi=excluded.roi`,
    args: [experimentId, modelId, `時系列バックテスト ${payload.period.from}〜${payload.period.to}`,
      all.investment, all.return_amount, all.profit, all.roi, races.length] });
  for (const strategy of payload.strategies) {
    await db.execute({ sql: `INSERT INTO experiment_strategy_results
        (id,experiment_id,strategy_key,purchase_race_count,skipped_race_count,investment,return_amount,profit,roi)
        VALUES (?,?,?,?,?,?,?,?,?) ON CONFLICT(experiment_id,strategy_key) DO UPDATE SET
        purchase_race_count=excluded.purchase_race_count,skipped_race_count=excluded.skipped_race_count,
        investment=excluded.investment,return_amount=excluded.return_amount,profit=excluded.profit,roi=excluded.roi`,
      args: [`experiment-strategy:${experimentId}:${strategy.strategy_key}`, experimentId, strategy.strategy_key,
        strategy.purchase_race_count, strategy.skipped_race_count, strategy.investment,
        strategy.return_amount, strategy.profit, strategy.roi] });
  }
}

console.log(`Worker出力をTursoへ保存: ${races.length}レース (${input})`);
