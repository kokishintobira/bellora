"use client";

import { useState } from "react";
import { CommentBox } from "./CommentBox";
import { PageHeading } from "./PageHeading";
import { StakePicker } from "./StakePicker";
import { useKeirinSettings } from "./KeirinProvider";
import { formatYen, scaleMoney } from "@/lib/keirin/calculations";
import { isEligibleForStrategy, recommendationLabel } from "@/lib/keirin/suitability";
import type { PurchaseDecision, StrategyKey } from "@/lib/keirin/types";

export function TodayView() {
  const { baseStake, data, defaultStrategy, setDefaultStrategy } = useKeirinSettings();
  const { todayPredictions } = data;
  const strategy = defaultStrategy;
  const [manualDecisions, setManualDecisions] = useState<Record<string, PurchaseDecision>>({});
  const totalBets = todayPredictions.reduce((count, prediction) => count + prediction.bets.length, 0);
  const isSelected = (id: string, grade: "A" | "B" | "C" | "D", sufficient: boolean) =>
    (manualDecisions[id] ?? (strategy === "all" || (sufficient && isEligibleForStrategy(grade, strategy)) ? "buy" : "skip")) === "buy";
  const selectedPredictions = todayPredictions.filter((prediction) => isSelected(prediction.id, prediction.suitability.grade, prediction.suitability.isDataSufficient));
  const totalInvestment = selectedPredictions.reduce((sum, prediction) => sum + prediction.bets.reduce((betSum, bet) => betSum + scaleMoney(bet.amount, baseStake), 0), 0);

  function changeStrategy(value: StrategyKey) {
    setDefaultStrategy(value);
    setManualDecisions({});
  }

  return (
    <>
      <PageHeading eyebrow="Today's predictions" title="今日の予想" description={`${todayPredictions[0]?.date ?? "対象日なし"}・ ${todayPredictions.length}レース / ${totalBets}買い目（実データ）`} action={<StakePicker compact />} />
      <div className="k-strategy-bar" aria-label="購入戦略">
        <div><strong>購入戦略</strong><span>過去の類似条件から購入対象を絞り込みます</span></div>
        <div className="k-strategy-options">
          {([
            ["suitability_a", "Aのみ"],
            ["suitability_ab", "A・Bのみ"],
            ["all", "全レース"],
          ] as const).map(([key, label]) => <button type="button" key={key} className={strategy === key ? "is-active" : ""} onClick={() => changeStrategy(key)}>{label}</button>)}
        </div>
      </div>
      <section className="k-summary-strip" aria-label="本日の予想サマリー">
        <div><span>選別後の仮想投資</span><strong>{formatYen(totalInvestment)}</strong></div>
        <div><span>購入候補</span><strong>{selectedPredictions.length}レース</strong></div>
        <div><span>見送り</span><strong>{todayPredictions.length - selectedPredictions.length}レース</strong></div>
        <div><span>全対象</span><strong>{todayPredictions.length}レース</strong></div>
        <div><span>データ更新</span><strong>{new Date(data.generatedAt).toLocaleTimeString("ja-JP", { hour: "2-digit", minute: "2-digit" })}</strong></div>
      </section>

      <section className="k-content-row">
        <div className="k-race-grid">
          {todayPredictions.length === 0 && <div className="k-card k-card-pad">当日の予測はまだありません。Worker実行後に表示されます。</div>}
          {todayPredictions.map((prediction) => {
            const investment = prediction.bets.reduce((sum, bet) => sum + scaleMoney(bet.amount, baseStake), 0);
            const recommended = prediction.bets[0];
            const selected = isSelected(prediction.id, prediction.suitability.grade, prediction.suitability.isDataSufficient);
            const suitability = prediction.suitability;
            return (
              <article key={prediction.id} className={`k-race-card ${selected ? "" : "is-skipped"}`}>
                <div className="k-race-top">
                  <div className="k-race-place"><span className="k-race-number">{prediction.raceNumber}<small>R</small></span><div><h3>{prediction.venue}</h3><p>発走 {prediction.startTime} ・ 二車単</p></div></div>
                  <span className={`k-confidence ${prediction.confidence === "中" ? "is-medium" : ""}`}>期待度 {prediction.confidence}</span>
                </div>
                <div className="k-race-main">
                  <div className="k-race-primary"><div><span>AI予想</span><strong>{recommended.combination}</strong></div><div><span>購入時の投資</span><strong>{formatYen(investment)}</strong></div></div>
                  <div className="k-suitability-panel">
                    <div className={`k-suitability-grade is-${suitability.grade.toLowerCase()}`}><span>AI適性</span><strong>{suitability.grade}</strong></div>
                    <div><span>類似条件</span><strong>{suitability.similarRaceCount.toLocaleString()}レース</strong>{!suitability.isDataSufficient && <em>データ不足</em>}</div>
                    <div><span>過去回収率</span><strong>{suitability.historicalRoi.toFixed(1)}%</strong></div>
                    <div><span>過去的中率</span><strong>{suitability.historicalHitRate.toFixed(1)}%</strong></div>
                  </div>
                  <div className="k-decision-row">
                    <div><span>AI推奨</span><strong className={suitability.recommendation === "buy" ? "is-buy" : "is-skip"}>{recommendationLabel(suitability.recommendation)}</strong></div>
                    <div className="k-decision-buttons" aria-label={`${prediction.venue}${prediction.raceNumber}Rの購入判断`}>
                      <button type="button" className={selected ? "is-buy" : ""} onClick={() => setManualDecisions((current) => ({ ...current, [prediction.id]: "buy" }))}>購入候補</button>
                      <button type="button" className={!selected ? "is-skip" : ""} onClick={() => setManualDecisions((current) => ({ ...current, [prediction.id]: "skip" }))}>見送り</button>
                    </div>
                  </div>
                  <div className="k-bet-list">
                    <div className="k-bet-row"><span>買い目</span><span>投資</span><span>オッズ</span><span>想定払戻</span></div>
                    {prediction.bets.map((bet) => {
                      const amount = scaleMoney(bet.amount, baseStake);
                      return <div className="k-bet-row" key={bet.combination}><b>{bet.combination}</b><span>{formatYen(amount)}</span><span>{bet.odds.toFixed(1)}</span><span>{formatYen(amount * bet.odds)}</span></div>;
                    })}
                  </div>
                  <CommentBox targetId={prediction.id} compact />
                </div>
              </article>
            );
          })}
        </div>
      </section>
      <div className="k-disclaimer">AI適性はレース開始前に確定した過去データだけで判定します。見送ったレースも結果確定後に仮想成績を追跡します。オッズは取得時点の参考値です。</div>
    </>
  );
}
