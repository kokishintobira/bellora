import type { DailyResult } from "@/lib/keirin/types";
import { formatYen } from "@/lib/keirin/calculations";

export function ProfitChart({ dailyResults }: { dailyResults: DailyResult[] }) {
  const recent = [...dailyResults].slice(0, 7).reverse();
  const values = recent.map((_, index) => recent.slice(0, index + 1).reduce((sum, result) => sum + result.profit, 0));
  const labels = recent.map((result) => {
    const [, month, day] = result.date.split("-");
    return `${Number(month)}/${Number(day)}`;
  });
  if (values.length === 0) return <div className="k-chart-wrap">確定済みデータがありません。</div>;
  const width = 640;
  const height = 190;
  const padX = 38;
  const padY = 20;
  const extent = Math.max(1000, ...values.map((value) => Math.abs(value)));
  const min = -extent * 1.2;
  const max = extent * 1.2;
  const x = (index: number) => values.length === 1 ? width / 2 : padX + (index * (width - padX * 2)) / (values.length - 1);
  const y = (value: number) => padY + ((max - value) * (height - padY * 2)) / (max - min);
  const line = values.map((value, index) => `${index ? "L" : "M"}${x(index)},${y(value)}`).join(" ");
  const area = `${line} L${x(values.length - 1)},${height - padY} L${x(0)},${height - padY} Z`;

  return (
    <div className="k-chart-wrap" aria-label="過去7日間の累積収支グラフ">
      <svg viewBox={`0 0 ${width} ${height}`} role="img">
        <defs><linearGradient id="profitGradient" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor="#5b9c82" stopOpacity=".28" /><stop offset="100%" stopColor="#5b9c82" stopOpacity=".015" /></linearGradient></defs>
        {[0, 1, 2, 3].map((index) => <line key={index} x1={padX} x2={width - padX} y1={padY + index * 50} y2={padY + index * 50} className="k-chart-grid" />)}
        <line x1={padX} x2={width - padX} y1={y(0)} y2={y(0)} className="k-chart-zero" />
        <path d={area} className="k-chart-area" />
        <path d={line} className="k-chart-line" />
        {values.map((value, index) => <circle key={labels[index]} cx={x(index)} cy={y(value)} r={index === values.length - 1 ? 4 : 3} className="k-chart-dot" />)}
        {labels.map((label, index) => <text key={label} x={x(index)} y={height - 3} textAnchor="middle" className="k-chart-label">{label}</text>)}
        <text x="2" y={y(extent) + 3} className="k-chart-label">+{Math.round(extent / 1000)}千</text>
        <text x="19" y={y(0) + 3} className="k-chart-label">0</text>
        <text x="5" y={y(-extent) + 3} className="k-chart-label">-{Math.round(extent / 1000)}千</text>
      </svg>
      <div className="k-chart-tooltip">{labels.at(-1)}<b>{formatYen(values.at(-1) ?? 0, true)}</b></div>
    </div>
  );
}
