import { getStats, getRecentReports } from '../services/statsService.js';
import { crimeRepository } from '../services/crimeRepository.js';
import { getOverview } from '../services/officialService.js';
import { getStore } from '../store/index.js';

export const stats = (_req, res) => res.json({ ...getStats(), dataKind: 'sample' });

export function recentReports(req, res) {
  const limit = Math.min(Math.max(Number(req.query.limit) || 6, 1), 30);
  res.json({ dataKind: 'sample', data: getRecentReports(limit) });
}

/** Headline numbers: official statistics, community reports and the sample map are reported separately. */
export async function overview(_req, res) {
  res.json(await getOverview({ store: await getStore(), sampleAreas: crimeRepository.all().length }));
}
