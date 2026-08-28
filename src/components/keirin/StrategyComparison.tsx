import { calculatePerformance, formatRoi, formatYen, scaleMoney } from "@/lib/keirin/calculations";
import type { StrategyKey, StrategyPerformance } from "@/lib/keirin/types";

export function StrategyComparison({ strategies, baseStake = 500, compact = false, selectedStrategy = "suitability_ab" }: { strategies: StrategyPerformance[]; baseStake?: number; compact?: boolean; selectedStrategy?: StrategyKey }) {
  const scaled = strategies.map((strategy) => ({
    ...strategy,
    ...calculatePerformance(
      scaleMoney(strategy.investment, baseStake),
      scaleMoney(strategy.returnAmount, baseStake),
    ),
  }));
  const all = scaled.find((strategy) => strategy.key === "all");
  const selected = scaled.find((strategy) => strategy.key === selectedStrategy);
  const improvement = all?.roi !== null && selected?.roi !== null && all?.roi !== undefined && selected?.roi !== undefined ? selected.roi - all.roi : null;

  return (
    <section className={`k-strategy-comparison ${compact ? "is-compact" : ""}`} aria-label="購入戦略の比較">
      <div className="k-strategy-comparison-head">
        <div><strong>購入戦略の比較</strong><span>買わない判断でROIが改善したかを検証</span></div>
        {improvement !== null && <em className={improvement >= 0 ? "is-positive" : "is-negative"}>{improvement >= 0 ? "↗" : "↘"} {improvement >= 0 ? "+" : ""}{improvement.toFixed(1)}pt</em>}
      </div>
      <div className="k-strategy-table">
        <div className="k-strategy-table-head"><span>戦略</span><span>投資額</span><span>回収金</span><span>収支</span><span>ROI</span><span>購入 / 見送り</span></div>
        {scaled.map((strategy) => <div className={`k-strategy-table-row ${strategy.key === selectedStrategy ? "is-selected" : ""}`} key={strategy.key}>
          <strong>{strategy.label}{strategy.key === selectedStrategy ? "（選択中）" : ""}</strong>
          <span>{formatYen(strategy.investment)}</span>
          <span>{formatYen(strategy.returnAmount)}</span>
          <span className={strategy.profit >= 0 ? "is-positive" : "is-negative"}>{formatYen(strategy.profit, true)}</span>
          <b>{formatRoi(strategy.roi)}</b>
          <span>{strategy.purchaseRaceCount}R / {strategy.skippedRaceCount}R</span>
        </div>)}
      </div>
    </section>
  );
}
