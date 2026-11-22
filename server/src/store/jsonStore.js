/**
 * store/jsonStore.js - zero-setup storage (a JSON file). Same interface as pgStore.
 * Fine for local dev and demos. NOT for Vercel (read-only filesystem) - use PostgreSQL there.
 */
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import path from 'node:path';

const officialKey = (r) => [r.sourceName, r.province, r.district, r.category, r.period].join('|');
const copy = (v) => structuredClone(v);

export function createJsonStore({ dir }) {
  const file = path.join(dir, 'store.json');
  let state = null;
  let queue = Promise.resolve();

  async function load() {
    if (state) return state;
    try {
      state = JSON.parse(await readFile(file, 'utf-8'));
    } catch (e) {
      if (e.code !== 'ENOENT') throw e;
      state = {};
    }
    state.reports ??= [];
    state.official ??= [];
    return state;
  }

  /** Writes are serialised and atomic (temp file + rename), so a crash cannot corrupt the file. */
  function persist() {
    queue = queue.catch(() => {}).then(async () => {
      await mkdir(dir, { recursive: true });
      const tmp = `${file}.tmp`;
      await writeFile(tmp, JSON.stringify(state, null, 2));
      await rename(tmp, file);
    });
    return queue;
  }

  return {
    kind: 'json',
    async init() { await load(); },
    async close() {},

    async listReports({ statuses, city, category, limit = 200 } = {}) {
      const s = await load();
      return copy(
        s.reports
          .filter((r) => (!statuses || statuses.includes(r.status)) && (!city || r.city === city) && (!category || r.category === category))
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, limit)
      );
    },

    async getReport(id) {
      const s = await load();
      const r = s.reports.find((x) => x.id === id);
      return r ? copy(r) : null;
    },

    async insertReport(report) {
      const s = await load();
      s.reports.push(copy(report));
      await persist();
      return copy(report);
    },

    async updateReport(id, patch) {
      const s = await load();
      const r = s.reports.find((x) => x.id === id);
      if (!r) return null;
      Object.assign(r, patch);
      await persist();
      return copy(r);
    },

    async countReportsByStatus() {
      const s = await load();
      const out = { pending: 0, verified: 0, rejected: 0 };
      for (const r of s.reports) out[r.status] += 1;
      return out;
    },

    async listOfficial() {
      const s = await load();
      return copy(s.official);
    },

    /** Insert new rows, update existing ones (same source/province/district/category/period). */
    async upsertOfficial(rows) {
      const s = await load();
      const index = new Map(s.official.map((r, i) => [officialKey(r), i]));
      const importedAt = new Date().toISOString();
      let inserted = 0;
      let updated = 0;
      for (const row of rows) {
        const rec = { ...row, importedAt };
        const at = index.get(officialKey(rec));
        if (at === undefined) { index.set(officialKey(rec), s.official.push(rec) - 1); inserted += 1; }
        else { s.official[at] = rec; updated += 1; }
      }
      await persist();
      return { inserted, updated };
    },
  };
}
