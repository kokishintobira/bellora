"use client";

import { useState } from "react";
import { CommentBox } from "./CommentBox";
import { PageHeading } from "./PageHeading";
import { StrategyComparison } from "./StrategyComparison";
import { useKeirinSettings } from "./KeirinProvider";
import { formatRoi, formatYen } from "@/lib/keirin/calculations";

export function ExperimentsView() {
  const { data } = useKeirinSettings();
  const { experiments } = data;
  const [tab, setTab] = useState<"experiments" | "backtest">("experiments");

  return (
    <>
      <PageHeading eyebrow="Model experiments" title="実験とバックテスト" description="モデルごとの仮想投資パフォーマンスを比較" />
      <div className="k-tabs" role="tablist" aria-label="実験メニュー">
        <button type="button" role="tab" aria-selected={tab === "experiments"} className={tab === "experiments" ? "is-active" : ""} onClick={() => setTab("experiments")}>実験履歴</button>
        <button type="button" role="tab" aria-selected={tab === "backtest"} className={tab === "backtest" ? "is-active" : ""} onClick={() => setTab("backtest")}>バックテスト条件</button>
      </div>

      <div className="k-experiment-grid">
        <section className="k-history-accordion">
          {experiments.length === 0 && <div className="k-card k-card-pad">実バックテスト結果はまだありません。</div>}
          {experiments.map((experiment) => (
            <article className="k-card k-experiment-card" key={experiment.id}>
              <div className="k-experiment-title"><div><h3>{experiment.name}</h3><p>{experiment.model} ・ {experiment.version} ・ {experiment.period}</p></div><span className="k-status">{experiment.status}</span></div>
              <div className="k-experiment-metrics">
                <div><span>回収率</span><strong>{formatRoi(experiment.roi)}</strong></div>
                <div><span>投資額</span><strong>{formatYen(experiment.investment)}</strong></div>
                <div><span>回収金</span><strong>{formatYen(experiment.returnAmount)}</strong></div>
                <div><span>収支</span><strong className={experiment.profit >= 0 ? "k-history-profit is-positive" : "k-history-profit is-negative"}>{formatYen(experiment.profit, true)}</strong></div>
              </div>
              {experiment.strategies.length > 0 && <StrategyComparison strategies={experiment.strategies} compact />}
              <details className="k-feature-details"><summary>詳細設定を開く（{experiment.raceCount.toLocaleString()}レース・特徴量 {experiment.features.length}件）</summary><div className="k-feature-list">{experiment.features.map((feature) => <span key={feature}>{feature}</span>)}</div></details>
              <CommentBox targetId={experiment.id} compact />
            </article>
          ))}
        </section>

        <aside className="k-card k-backtest-panel">
          <h2>{tab === "backtest" ? "バックテスト条件" : "新しい比較"}</h2>
          <p>期間と投資ルールを指定し、過去データで仮想投資を検証します。</p>
          <div className="k-form-grid">
            <div className="k-field"><label htmlFor="start-date">開始日</label><input id="start-date" type="date" defaultValue="2026-01-01" /></div>
            <div className="k-field"><label htmlFor="end-date">終了日</label><input id="end-date" type="date" defaultValue="2026-06-30" /></div>
            <div className="k-field is-full"><label htmlFor="model">モデル</label><select id="model" defaultValue="v1.8.2"><option value="v1.8.2">LightGBM Ranker v1.8.2</option><option value="v1.8.1">LightGBM Ranker v1.8.1</option></select></div>
            <div className="k-field"><label htmlFor="bet-amount">1買い目金額</label><input id="bet-amount" type="number" min="100" step="100" defaultValue="500" /></div>
            <div className="k-field"><label htmlFor="min-ev">最低期待値</label><input id="min-ev" type="number" min="1" step="0.01" defaultValue="1.1" /></div>
            <div className="k-field is-full"><label htmlFor="confidence">最低 confidence</label><input id="confidence" type="number" min="0" max="1" step="0.05" defaultValue="0.65" /></div>
            <div className="k-field is-full"><label htmlFor="purchase-strategy">購入戦略</label><select id="purchase-strategy" defaultValue="compare"><option value="compare">全レース / A・Bを比較</option><option value="suitability_a">AI適性 Aのみ</option><option value="suitability_ab">AI適性 A・Bのみ</option><option value="all">全対象レース</option></select></div>
          </div>
          <button type="button" className="k-button-primary k-form-action" disabled>ローカルWorkerで実行</button>
          <div className="k-worker-note"><span />バックテストはローカルWorkerで実計算し、保存済み結果を表示します。</div>
        </aside>
      </div>
    </>
  );
}
