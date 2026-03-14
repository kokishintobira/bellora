/** Format number with comma separators: 12345 → "12,345" */
export function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

/** Format growth rate: 0.235 → "+23.5%", -0.12 → "-12.0%" */
export function formatGrowthRate(rate: number): string {
  const pct = (rate * 100).toFixed(1);
  return rate >= 0 ? `+${pct}%` : `${pct}%`;
}

/** Week slug to display label: "2026-W08" → "2026年 第8週" */
export function weekSlugToLabel(slug: string): string {
  const match = slug.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return slug;
  const [, year, week] = match;
  return `${year}年 第${parseInt(week, 10)}週`;
}

/** Week slug to approximate date range: "2026-W08" → "2/16 - 2/22" */
export function weekSlugToDateRange(slug: string): string {
  const match = slug.match(/^(\d{4})-W(\d{2})$/);
  if (!match) return "";
  const [, yearStr, weekStr] = match;
  const year = parseInt(yearStr, 10);
  const week = parseInt(weekStr, 10);

  // ISO week date: week 1 contains the first Thursday of the year
  const jan4 = new Date(year, 0, 4);
  const dayOfWeek = jan4.getDay() || 7; // Monday=1
  const mondayW1 = new Date(jan4);
  mondayW1.setDate(jan4.getDate() - dayOfWeek + 1);

  const monday = new Date(mondayW1);
  monday.setDate(mondayW1.getDate() + (week - 1) * 7);

  const sunday = new Date(monday);
  sunday.setDate(monday.getDate() + 6);

  const fmt = (d: Date) => `${d.getMonth() + 1}/${d.getDate()}`;
  return `${fmt(monday)} - ${fmt(sunday)}`;
}

/** ISO date string to readable: "2026-02-22T10:00:00Z" → "2026/2/22" */
export function formatDate(iso: string): string {
  const d = new Date(iso);
  return `${d.getFullYear()}/${d.getMonth() + 1}/${d.getDate()}`;
}
