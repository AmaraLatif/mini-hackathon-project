import { getStore } from '../store/index.js';
import { getOfficialSummary } from '../services/officialService.js';

export async function summary(req, res) {
  const { source, periodType, province, district, category, from, to } = req.query;
  res.json(await getOfficialSummary({ source, periodType, province, district, category, from, to }, { store: await getStore() }));
}
