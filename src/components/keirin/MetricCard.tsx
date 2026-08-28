import { formatRoi, formatYen } from "@/lib/keirin/calculations";

type Props = {
  label: string;
  value: number | null;
  type?: "money" | "profit" | "roi";
  emphasized?: boolean;
  note?: string;
};

export function MetricCard({ label, value, type = "money", emphasized, note }: Props) {
  const positive = value !== null && (type === "roi" ? value >= 100 : type === "profit" ? value >= 0 : true);
  const negative = value !== null && (type === "roi" ? value < 100 : type === "profit" ? value < 0 : false);
  const formatted = type === "roi" ? formatRoi(value) : value === null ? "—" : formatYen(value, type === "profit");

  return (
    <article className={`k-metric ${emphasized ? "k-metric-primary" : ""} ${negative ? "is-negative" : ""}`}>
      <div className="k-metric-label"><span>{label}</span>{type === "roi" && <i className={positive ? "is-up" : "is-down"}>{positive ? "↗" : "↘"}</i>}</div>
      <strong>{formatted}</strong>
      {note && <small>{note}</small>}
    </article>
  );
}
