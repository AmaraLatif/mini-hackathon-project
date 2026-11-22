/**
 * crimeRepository.js - the ONLY file that knows where crime data lives.
 * Today: a JSON file (shared/crimeData.json). Tomorrow: MongoDB / Postgres /
 * Supabase - rewrite these methods and nothing else in the server changes.
 */
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const dataPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../../shared/crimeData.json');

let cache = null;
function load() {
  if (!cache) cache = JSON.parse(readFileSync(dataPath, 'utf-8'));
  return cache;
}

const norm = (s) => String(s ?? '').trim().toLowerCase();

export const crimeRepository = {
  all() {
    return load();
  },

  findById(id) {
    return load().find((c) => c.id === id) ?? null;
  },

  /** Filter by city, risk level, crime type and a free-text query. */
  list({ city, risk, type, q } = {}) {
    return load().filter((c) => {
      if (city && norm(c.city) !== norm(city)) return false;
      if (risk && norm(c.riskLevel) !== norm(risk)) return false;
      if (type && norm(c.crimeType) !== norm(type)) return false;
      if (q) {
        const hay = norm(`${c.area} ${c.city} ${c.crimeType} ${c.description}`);
        if (!hay.includes(norm(q))) return false;
      }
      return true;
    });
  },
};
