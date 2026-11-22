/**
 * Module 2 - loads crime records.
 * Default ("local"): lazy-loads shared/crimeData.json, so the map works with no backend.
 * Set VITE_CRIME_SOURCE=api to read GET /api/crimes instead.
 */
const SOURCE = import.meta.env.VITE_CRIME_SOURCE || 'local';
const API_BASE = import.meta.env.VITE_API_URL || '/api';

export async function getCrimes() {
  if (SOURCE === 'api') {
    const res = await fetch(`${API_BASE}/crimes`);
    if (!res.ok) throw new Error(`Could not load areas (${res.status})`);
    return (await res.json()).data;
  }
  const mod = await import('@shared/crimeData.json');
  return mod.default;
}
