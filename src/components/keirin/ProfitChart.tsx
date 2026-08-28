const values = [-3900, -2100, 1300, 900, 4740, 2940, 5140];
const labels = ["8/21", "8/22", "8/23", "8/24", "8/25", "8/26", "8/27"];

export function ProfitChart() {
  const width = 640;
  const height = 190;
  const padX = 38;
  const padY = 20;
  const min = -5000;
  const max = 7000;
  const x = (index: number) => padX + (index * (width - padX * 2)) / (values.length - 1);
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
        <text x="2" y={y(5000) + 3} className="k-chart-label">+5千</text>
        <text x="19" y={y(0) + 3} className="k-chart-label">0</text>
        <text x="5" y={y(-5000) + 3} className="k-chart-label">-5千</text>
      </svg>
      <div className="k-chart-tooltip">8月27日<b>+5,140円</b></div>
    </div>
  );
}
