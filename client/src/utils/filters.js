/** Module 2 - pure functions for filtering and searching crime records. */
import { riskOrder } from './risk';

export const DEFAULT_FILTERS = {
  city: 'All',
  type: 'All',
  risks: ['Low', 'Medium', 'High'],
};

export function applyFilters(crimes, { city, type, risks }) {
  return crimes.filter(
    (c) =>
      (city === 'All' || c.city === city) &&
      (type === 'All' || c.crimeType === type) &&
      risks.includes(c.riskLevel)
  );
}

/** Ranks areas by how well they match a search string (area name > city > type). */
export function searchAreas(crimes, query, limit = 6) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  return crimes
    .map((c) => {
      const area = c.area.toLowerCase();
      const city = c.city.toLowerCase();
      const type = c.crimeType.toLowerCase();
      let score = 0;
      if (area.startsWith(q)) score = 4;
      else if (area.includes(q)) score = 3;
      else if (city.startsWith(q)) score = 2;
      else if (city.includes(q) || type.includes(q)) score = 1;
      return { c, score };
    })
    .filter((x) => x.score > 0)
    .sort((a, b) => b.score - a.score || riskOrder[b.c.riskLevel] - riskOrder[a.c.riskLevel])
    .slice(0, limit)
    .map((x) => x.c);
}

export const uniqueSorted = (list) => [...new Set(list)].sort((a, b) => a.localeCompare(b));
