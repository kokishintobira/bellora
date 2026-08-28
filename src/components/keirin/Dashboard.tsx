"use client";

import Link from "next/link";
import { ChevronIcon } from "./Icons";
import { MetricCard } from "./MetricCard";
import { PageHeading } from "./PageHeading";
import { ProfitChart } from "./ProfitChart";
import { SectionHeading } from "./SectionHeading";
import { StakePicker } from "./StakePicker";
import { useKeirinSettings } from "./KeirinProvider";
import { formatRoi, formatYen, scalePerformance } from "@/lib/keirin/calculations";

function dateParts(date: string) {
  const value = new Date(`${date}T00:00:00+09:00`);
  return { month: value.getMonth() + 1, day: value.getDate(), weekday: "日月火水木金土"[value.getDay()] };
}

export function Dashboard() {
  const { baseStake, data } = useKeirinSettings();
  const { dailyResults, monthPerformance } = data;
  const month = scalePerformance(monthPerformance, baseStake);
  const yesterday = dailyResults[0] ? scalePerformance(dailyResults[0], baseStake) : null;

  return (
    <>
      <PageHeading eyebrow="Performance overview" title="今月のシミュレーション成績" description="Workerが保存した確定済み実データ" action={<StakePicker compact />} />
      <section className="k-kpi-grid" aria-label="今月の主要指標">
        <MetricCard label="投資額" value={month.investment} note="確定済みデータ" />
        <MetricCard label="回収金" value={month.returnAmount} note="公式払戻で計算" />
        <MetricCard label="収支" value={month.profit} type="profit" note="回収金 − 投資額" />
        <MetricCard label="回収率" value={month.roi} type="roi" emphasized note="回収金 ÷ 投資額" />
      </section>

      <section className="k-dashboard-grid">
        <div className="k-card k-card-pad">
          <SectionHeading title="累積収支の推移" subtitle="直近7日間・仮想投資ベース" action={<Link href="/keirin/history">履歴を見る <ChevronIcon /></Link>} />
          <ProfitChart dailyResults={dailyResults} />
        </div>
        <aside className="k-card k-yesterday">
          <SectionHeading title="直近の結果" subtitle={dailyResults[0]?.date ?? "確定データなし"} />
          {yesterday ? <><div className="k-result-hero"><span>回収率</span><strong>{formatRoi(yesterday.roi)}</strong></div>
          <div className="k-result-stats">
            <div><span>投資額</span><b>{formatYen(yesterday.investment)}</b></div>
            <div><span>回収金</span><b>{formatYen(yesterday.returnAmount)}</b></div>
            <div><span>収支</span><b>{formatYen(yesterday.profit, true)}</b></div>
            <div><span>購入対象</span><b>{dailyResults[0].betCount} / {dailyResults[0].raceCount}R</b></div>
          </div>
          <div className="k-result-footer"><Link className="k-link-arrow" href="/keirin/history">レース別結果を見る <ChevronIcon /></Link></div></> : <div className="k-card-pad">確定済み結果はまだありません。</div>}
        </aside>
      </section>

      <section className="k-content-row">
        <SectionHeading title="日次履歴" subtitle="直近のシミュレーション結果" action={<Link href="/keirin/history">すべて表示 <ChevronIcon /></Link>} />
        <div className="k-history-list">
          <div className="k-history-header"><span>日付</span><span>投資額</span><span>回収金</span><span>収支</span><span>回収率</span><span /></div>
          {dailyResults.slice(0, 4).map((result) => {
            const scaled = scalePerformance(result, baseStake);
            const date = dateParts(result.date);
            return <Link key={result.id} href={`/keirin/history#${result.id}`} className="k-history-item">
              <div className="k-history-date"><span className="k-date-box"><span><small>{date.month}月</small><b>{date.day}</b></span></span><span>{date.month}月{date.day}日（{date.weekday}）<small>{result.betCount}レース購入</small></span></div>
              <span className="k-history-number">{formatYen(scaled.investment)}</span>
              <span className="k-history-number">{formatYen(scaled.returnAmount)}</span>
              <span className={`k-history-number k-history-profit ${scaled.profit >= 0 ? "is-positive" : "is-negative"}`}>{formatYen(scaled.profit, true)}</span>
              <span className={`k-roi-pill ${(scaled.roi ?? 0) < 100 ? "is-negative" : ""}`}>{formatRoi(scaled.roi)}</span>
              <ChevronIcon />
            </Link>;
          })}
        </div>
      </section>
      <div className="k-disclaimer">本サービスは予測ルールの仮想投資結果を検証するシミュレーションです。実際の車券購入や利益を保証するものではありません。</div>
    </>
  );
}
