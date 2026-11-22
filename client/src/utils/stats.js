/** Module 2 - turns a list of crime records into the numbers the dashboard shows. */
import { calcSafetyScore } from './risk';

export function computeStats(crimes) {
  const count = (risk) => crimes.filter((c) => c.riskLevel === risk).length;

  const typeMap = new Map();
  const cityMap = new Map();
  let scoreSum = 0;

  for (const c of crimes) {
    typeMap.set(c.crimeType, (typeMap.get(c.crimeType) || 0) + 1);
    const row = cityMap.get(c.city) || { city: c.city, Low: 0, Medium: 0, High: 0, total: 0 };
    row[c.riskLevel] += 1;
    row.total += 1;
    cityMap.set(c.city, row);
    scoreSum += calcSafetyScore(c);
  }

  const recent = [...crimes].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt));

  return {
    total: crimes.length,
    high: count('High'),
    medium: count('Medium'),
    low: count('Low'),
    latest: recent[0] ?? null,
    recent: recent.slice(0, 6),
    averageScore: crimes.length ? Math.round(scoreSum / crimes.length) : null,
    byType: [...typeMap].map(([label, n]) => ({ label, count: n })).sort((a, b) => b.count - a.count),
    byCity: [...cityMap.values()].sort((a, b) => b.High - a.High || b.total - a.total),
  };
}
