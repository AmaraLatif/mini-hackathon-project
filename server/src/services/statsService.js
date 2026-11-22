import { crimeRepository } from './crimeRepository.js';
import { calcSafetyScore } from '../../../shared/riskScore.js';

const countBy = (list, key) =>
  list.reduce((acc, item) => {
    acc[item[key]] = (acc[item[key]] || 0) + 1;
    return acc;
  }, {});

export function getStats() {
  const all = crimeRepository.all();
  const byRisk = countBy(all, 'riskLevel');
  const latest = [...all].sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))[0] ?? null;
  const avg = all.length ? Math.round(all.reduce((s, c) => s + calcSafetyScore(c), 0) / all.length) : null;

  return {
    totalAreas: all.length,
    cities: new Set(all.map((c) => c.city)).size,
    byRisk: { Low: byRisk.Low || 0, Medium: byRisk.Medium || 0, High: byRisk.High || 0 },
    byCrimeType: countBy(all, 'crimeType'),
    averageSafetyScore: avg,
    latestIncident: latest,
  };
}

export function getRecentReports(limit = 6) {
  return [...crimeRepository.all()]
    .sort((a, b) => b.reportedAt.localeCompare(a.reportedAt))
    .slice(0, limit);
}
