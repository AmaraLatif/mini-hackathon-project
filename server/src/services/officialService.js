/**
 * officialService.js - published police / government statistics.
 *
 * Rules that keep the numbers honest:
 *  - every row carries its source (name + URL) and reporting period;
 *  - one summary only ever uses ONE source and ONE period type, because two
 *    sources (or a yearly and a monthly row) often describe the same cases and
 *    adding them would double count;
 *  - community reports are never included here.
 */
import { httpError } from '../utils/httpError.js';

const clean = (v) => String(v ?? '').replace(/\s+/g, ' ').trim();
const truthy = (v) => v === true || ['true', '1', 'yes', 'y'].includes(clean(v).toLowerCase());
const pick = (raw, ...keys) => keys.map((k) => raw[k]).find((v) => v !== undefined && v !== null && v !== '');

/** Accepts camelCase or snake_case keys (JSON or CSV). Returns { rows, errors:[{row, message}] }. */
export function validateOfficialRows(rawRows) {
  const rows = [];
  const errors = [];

  rawRows.forEach((raw, i) => {
    const problems = [];
    const province = clean(pick(raw, 'province'));
    const district = clean(pick(raw, 'district'));
    const category = clean(pick(raw, 'category'));
    const period = clean(pick(raw, 'period'));
    const sourceName = clean(pick(raw, 'sourceName', 'source_name'));
    const sourceUrl = clean(pick(raw, 'sourceUrl', 'source_url'));
    const casesRaw = pick(raw, 'cases', 'count');

    if (!province) problems.push('province is required');
    if (!district) problems.push('district is required');
    if (!category) problems.push('category is required');
    if (!sourceName) problems.push('source_name is required');

    let periodType = null;
    if (/^\d{4}-(0[1-9]|1[0-2])$/.test(period)) periodType = 'monthly';
    else if (/^\d{4}$/.test(period)) periodType = 'yearly';
    else problems.push('period must be YYYY-MM or YYYY');

    let cases = null;
    if (typeof casesRaw === 'number' ? Number.isInteger(casesRaw) && casesRaw >= 0 : /^\d+$/.test(clean(casesRaw))) cases = Number(casesRaw);
    else problems.push('cases must be a whole number >= 0');

    try {
      const u = new URL(sourceUrl);
      if (!['http:', 'https:'].includes(u.protocol)) throw new Error('bad protocol');
    } catch {
      problems.push('source_url must be a valid http(s) link');
    }

    if (problems.length) errors.push({ row: i + 1, message: problems.join('; ') });
    else rows.push({ sourceName, sourceUrl, province, district, category, period, periodType, cases, isSample: truthy(pick(raw, 'isSample', 'is_sample')) });
  });

  return { rows, errors };
}

export async function importOfficialRows(rawRows, { store }) {
  const { rows, errors } = validateOfficialRows(rawRows);
  if (errors.length) throw httpError(400, 'Import rejected: some rows are invalid. Nothing was saved.', { errors });
  return store.upsertOfficial(rows);
}

const sum = (rows) => rows.reduce((s, r) => s + r.cases, 0);
const uniq = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b));

function groupSum(rows, key) {
  const map = new Map();
  for (const r of rows) map.set(r[key], (map.get(r[key]) || 0) + r.cases);
  return map;
}
const toList = (map, label) => [...map].map(([k, cases]) => ({ [label]: k, cases }));

const EMPTY = {
  hasData: false, sources: [], selected: null, totalCases: 0, byCategory: [], byDistrict: [], byPeriod: [],
  options: { provinces: [], districts: [], categories: [], periodTypes: [] }, lastUpdated: null, latestPeriod: null,
};

export async function getOfficialSummary(filters = {}, { store }) {
  const all = await store.listOfficial();
  if (!all.length) return EMPTY;

  // Per-source overview, so the UI can show where every number comes from.
  const bySource = new Map();
  for (const r of all) {
    const s = bySource.get(r.sourceName) || { name: r.sourceName, url: r.sourceUrl, rows: 0, includesSample: false, lastImportedAt: null };
    s.rows += 1;
    s.includesSample ||= r.isSample;
    if (!s.lastImportedAt || r.importedAt > s.lastImportedAt) s.lastImportedAt = r.importedAt;
    bySource.set(r.sourceName, s);
  }
  // Real sources first, then most rows, then name.
  const sources = [...bySource.values()].sort((a, b) => a.includesSample - b.includesSample || b.rows - a.rows || a.name.localeCompare(b.name));

  const source = sources.find((s) => s.name === filters.source) ?? sources[0];
  const ofSource = all.filter((r) => r.sourceName === source.name);
  const periodTypes = uniq(ofSource.map((r) => r.periodType));
  const periodType = periodTypes.includes(filters.periodType) ? filters.periodType : periodTypes.includes('monthly') ? 'monthly' : periodTypes[0];
  const base = ofSource.filter((r) => r.periodType === periodType);

  const rows = base.filter(
    (r) =>
      (!filters.province || r.province === filters.province) &&
      (!filters.district || r.district === filters.district) &&
      (!filters.category || r.category === filters.category) &&
      (!filters.from || r.period >= filters.from) &&
      (!filters.to || r.period <= filters.to)
  );

  const byPeriod = toList(groupSum(rows, 'period'), 'period').sort((a, b) => a.period.localeCompare(b.period));

  return {
    hasData: true,
    sources,
    selected: { source: source.name, sourceUrl: source.url, periodType, isSample: source.includesSample },
    totalCases: sum(rows),
    byCategory: toList(groupSum(rows, 'category'), 'category').sort((a, b) => b.cases - a.cases),
    byDistrict: toList(groupSum(rows, 'district'), 'district').sort((a, b) => b.cases - a.cases),
    byPeriod,
    options: {
      provinces: uniq(base.map((r) => r.province)),
      districts: uniq(base.map((r) => r.district)),
      categories: uniq(base.map((r) => r.category)),
      periodTypes,
    },
    lastUpdated: source.lastImportedAt,
    latestPeriod: uniq(base.map((r) => r.period)).at(-1) ?? null,
  };
}

/** Headline numbers for the dashboard strip. Official and community figures stay separate. */
export async function getOverview({ store, sampleAreas = 0 }) {
  const official = await getOfficialSummary({}, { store });
  const community = await store.countReportsByStatus();
  return {
    official: official.hasData
      ? {
          hasData: true,
          source: official.selected.source,
          isSample: official.selected.isSample,
          periodType: official.selected.periodType,
          totalCases: official.totalCases,
          latestPeriod: official.latestPeriod,
          lastUpdated: official.lastUpdated,
          sourceCount: official.sources.length,
        }
      : { hasData: false },
    community: { ...community, total: community.pending + community.verified + community.rejected },
    mapSample: { areas: sampleAreas, note: 'Map areas are illustrative sample data, not official statistics.' },
  };
}
