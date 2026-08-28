"use client";

import { CommentBox } from "./CommentBox";
import { ChevronIcon } from "./Icons";
import { MetricCard } from "./MetricCard";
import { PageHeading } from "./PageHeading";
import { StakePicker } from "./StakePicker";
import { useKeirinSettings } from "./KeirinProvider";
import { StrategyComparison } from "./StrategyComparison";
import { formatRoi, formatYen, scaleMoney, scalePerformance } from "@/lib/keirin/calculations";

function formatDate(date: string) {
  const value = new Date(`${date}T00:00:00+09:00`);
  return `${value.getFullYear()}年${value.getMonth() + 1}月${value.getDate()}日（${"日月火水木金土"[value.getDay()]}）`;
}

export function HistoryView() {
  const { baseStake, data } = useKeirinSettings();
  const { allTimePerformance, dailyResults } = data;
  const allTime = scalePerformance(allTimePerformance, baseStake);

  return (
    <>
      <PageHeading eyebrow="Simulation history" title="成績履歴" description="日付ごとの仮想投資結果とレース詳細" action={<StakePicker compact />} />
      <section className="k-kpi-grid" aria-label="全期間の主要指標">
        <MetricCard label="累積投資額" value={allTime.investment} note="保存済み全期間" />
        <MetricCard label="累積回収金" value={allTime.returnAmount} note="公式払戻で計算" />
        <MetricCard label="累積収支" value={allTime.profit} type="profit" note="回収金 − 投資額" />
        <MetricCard label="全期間 回収率" value={allTime.roi} type="roi" emphasized note="回収金 ÷ 投資額" />
      </section>

      <section className="k-content-row">
        <div className="k-history-accordion">
          {dailyResults.length === 0 && <div className="k-card k-card-pad">確定済みの実運用結果はまだありません。</div>}
          {dailyResults.map((result, index) => {
            const scaled = scalePerformance(result, baseStake);
            return (
              <details className="k-history-day" id={result.id} key={result.id} open={index === 0}>
                <summary>
                  <div><span>日付・購入対象</span><strong>{formatDate(result.date)}</strong><span>{result.betCount} / {result.raceCount}レース</span></div>
                  <div><span>投資額</span><strong>{formatYen(scaled.investment)}</strong></div>
                  <div><span>回収金</span><strong>{formatYen(scaled.returnAmount)}</strong></div>
                  <div><span>収支</span><strong className={scaled.profit >= 0 ? "k-history-profit is-positive" : "k-history-profit is-negative"}>{formatYen(scaled.profit, true)}</strong></div>
                  <div><span>回収率</span><strong><span className={`k-roi-pill ${(scaled.roi ?? 0) < 100 ? "is-negative" : ""}`}>{formatRoi(scaled.roi)}</span></strong></div>
                  <ChevronIcon />
                </summary>
                <div className="k-day-details">
                  {result.races.map((race) => (
                    <div className="k-race-result-row" key={race.id}>
                      <strong>{race.venue} {race.raceNumber}R <i className={`k-mini-grade is-${race.suitabilityGrade.toLowerCase()}`}>{race.suitabilityGrade}</i></strong>
                      <span>予想 {race.prediction}</span>
                      <span>結果 {race.result}</span>
                      <span>{formatYen(scaleMoney(race.returnAmount, baseStake))}</span>
                      <span className="k-result-badges"><i className={race.selectedBySuitability ? "k-hit" : "k-miss"}>{race.selectedBySuitability ? "購入" : "見送り"}</i><i className={race.isHit ? "k-hit" : "k-miss"}>{race.isHit ? "的中" : "ハズレ"}</i></span>
                    </div>
                  ))}
                  <StrategyComparison strategies={result.strategies} baseStake={baseStake} compact />
                  <CommentBox targetId={result.id} compact />
                </div>
              </details>
            );
          })}
        </div>
      </section>
    </>
  );
}
