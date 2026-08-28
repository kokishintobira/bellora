-- V1追加: AI得意レース判定・見送り機能
-- 既存テーブルを変更せず、適性スナップショットと戦略別成績を追加する。

CREATE TABLE IF NOT EXISTS suitability_condition_stats (
  id TEXT PRIMARY KEY,
  model_id TEXT NOT NULL REFERENCES models(id),
  condition_key TEXT NOT NULL,
  venue TEXT,
  field_size INTEGER,
  line_pattern TEXT,
  confidence_band TEXT,
  score_gap_band TEXT,
  odds_band TEXT,
  athlete_data_band TEXT,
  sample_count INTEGER NOT NULL,
  investment INTEGER NOT NULL,
  return_amount INTEGER NOT NULL,
  roi REAL,
  hit_rate REAL,
  data_cutoff_at TEXT NOT NULL,
  rule_version TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(model_id, condition_key, data_cutoff_at, rule_version)
);

CREATE TABLE IF NOT EXISTS prediction_suitability (
  id TEXT PRIMARY KEY,
  prediction_id TEXT NOT NULL UNIQUE REFERENCES predictions(id),
  grade TEXT NOT NULL CHECK(grade IN ('A','B','C','D')),
  similar_race_count INTEGER NOT NULL,
  historical_roi REAL NOT NULL,
  historical_hit_rate REAL NOT NULL,
  is_data_sufficient INTEGER NOT NULL DEFAULT 0,
  recommendation TEXT NOT NULL CHECK(recommendation IN ('buy','skip')),
  rule_version TEXT NOT NULL,
  feature_snapshot_json TEXT,
  data_cutoff_at TEXT NOT NULL,
  calculated_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CHECK(data_cutoff_at <= calculated_at)
);

CREATE TABLE IF NOT EXISTS simulation_strategy_results (
  id TEXT PRIMARY KEY,
  simulation_result_id TEXT NOT NULL REFERENCES simulation_results(id),
  strategy_key TEXT NOT NULL CHECK(strategy_key IN ('all','suitability_a','suitability_ab')),
  decision TEXT NOT NULL CHECK(decision IN ('buy','skip')),
  hypothetical_investment INTEGER NOT NULL,
  hypothetical_return_amount INTEGER NOT NULL,
  strategy_investment INTEGER NOT NULL,
  strategy_return_amount INTEGER NOT NULL,
  is_hypothetical_hit INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(simulation_result_id, strategy_key)
);

CREATE TABLE IF NOT EXISTS daily_strategy_results (
  id TEXT PRIMARY KEY,
  result_date TEXT NOT NULL,
  strategy_key TEXT NOT NULL CHECK(strategy_key IN ('all','suitability_a','suitability_ab')),
  purchase_race_count INTEGER NOT NULL DEFAULT 0,
  skipped_race_count INTEGER NOT NULL DEFAULT 0,
  investment INTEGER NOT NULL DEFAULT 0,
  return_amount INTEGER NOT NULL DEFAULT 0,
  profit INTEGER NOT NULL DEFAULT 0,
  roi REAL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  UNIQUE(result_date, strategy_key)
);

CREATE INDEX IF NOT EXISTS idx_suitability_stats_lookup ON suitability_condition_stats(model_id, condition_key, data_cutoff_at);
CREATE INDEX IF NOT EXISTS idx_prediction_suitability_grade ON prediction_suitability(grade, is_data_sufficient);
CREATE INDEX IF NOT EXISTS idx_strategy_results_strategy ON simulation_strategy_results(strategy_key, decision);
CREATE INDEX IF NOT EXISTS idx_daily_strategy_date ON daily_strategy_results(result_date, strategy_key);
