export interface DailyTonnagePoint {
  date: string;
  total: number;
  upper: number;
  lower: number;
}

export function filterByWindow(points: DailyTonnagePoint[], days: 7 | 30 | 90 | "all") {
  if (days === "all") return points;
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  return points.filter((p) => new Date(p.date) >= cutoff);
}

export function percentageDelta(current: number, previous: number) {
  if (previous === 0) return current === 0 ? 0 : 100;
  return ((current - previous) / previous) * 100;
}
