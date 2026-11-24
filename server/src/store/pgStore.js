/**
 * store/pgStore.js - PostgreSQL storage. Same interface as jsonStore.
 * `pg` is imported lazily, so JSON mode never needs it installed.
 */
import { readFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const schemaPath = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../db/schema.sql');

const iso = (v) => (v instanceof Date ? v.toISOString() : v ?? null);

const toReport = (r) => ({
  id: r.id,
  city: r.city,
  area: r.area,
  category: r.category,
  description: r.description,
  incidentDate: r.incident_date, // selected as text (YYYY-MM-DD)
  latitude: r.latitude,
  longitude: r.longitude,
  contact: r.contact,
  status: r.status,
  duplicateOf: r.duplicate_of,
  moderationNote: r.moderation_note,
  moderatedAt: iso(r.moderated_at),
  ipHash: r.ip_hash,
  createdAt: iso(r.created_at),
});

const toUser = (r) => ({
  id: r.id, name: r.name, email: r.email, passwordHash: r.password_hash, role: r.role,
  createdAt: iso(r.created_at), lastLoginAt: iso(r.last_login_at),
});
const USER_COLS = 'id, name, email, password_hash, role, created_at, last_login_at';

const REPORT_COLS = `id, city, area, category, description, incident_date::text AS incident_date,
  latitude, longitude, contact, status, duplicate_of, moderation_note, moderated_at, ip_hash, created_at`;

export async function createPgStore({ connectionString }) {
  const { default: pg } = await import('pg');
  const pool = new pg.Pool({ connectionString, max: 5 });

  return {
    kind: 'postgres',

    async init() {
      await pool.query(await readFile(schemaPath, 'utf-8'));
    },
    async close() {
      await pool.end();
    },

    async listReports({ statuses, city, category, limit = 200 } = {}) {
      const where = [];
      const args = [];
      if (statuses) { args.push(statuses); where.push(`status = ANY($${args.length})`); }
      if (city) { args.push(city); where.push(`city = $${args.length}`); }
      if (category) { args.push(category); where.push(`category = $${args.length}`); }
      args.push(limit);
      const sql = `SELECT ${REPORT_COLS} FROM community_reports ${where.length ? `WHERE ${where.join(' AND ')}` : ''}
                   ORDER BY created_at DESC LIMIT $${args.length}`;
      return (await pool.query(sql, args)).rows.map(toReport);
    },

    async getReport(id) {
      const { rows } = await pool.query(`SELECT ${REPORT_COLS} FROM community_reports WHERE id = $1`, [id]);
      return rows[0] ? toReport(rows[0]) : null;
    },

    async insertReport(r) {
      await pool.query(
        `INSERT INTO community_reports
           (id, city, area, category, description, incident_date, latitude, longitude, contact, status, duplicate_of, ip_hash, created_at)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
        [r.id, r.city, r.area, r.category, r.description, r.incidentDate, r.latitude, r.longitude, r.contact, r.status, r.duplicateOf, r.ipHash, r.createdAt]
      );
      return r;
    },

    async updateReport(id, patch) {
      const { rows } = await pool.query(
        `UPDATE community_reports
            SET status = COALESCE($2, status), moderation_note = $3, moderated_at = $4
          WHERE id = $1 RETURNING ${REPORT_COLS}`,
        [id, patch.status ?? null, patch.moderationNote ?? null, patch.moderatedAt ?? null]
      );
      return rows[0] ? toReport(rows[0]) : null;
    },

    async countReportsByStatus() {
      const { rows } = await pool.query('SELECT status, count(*)::int AS n FROM community_reports GROUP BY status');
      const out = { pending: 0, verified: 0, rejected: 0 };
      for (const r of rows) out[r.status] = r.n;
      return out;
    },

    // ---- users ----
    async getUserById(id) {
      const { rows } = await pool.query(`SELECT ${USER_COLS} FROM users WHERE id = $1`, [id]);
      return rows[0] ? toUser(rows[0]) : null;
    },

    async getUserByEmail(email) {
      const { rows } = await pool.query(`SELECT ${USER_COLS} FROM users WHERE email = $1`, [email]);
      return rows[0] ? toUser(rows[0]) : null;
    },

    /** Throws an error with code EMAIL_TAKEN when the email already exists. */
    async insertUser(u) {
      try {
        await pool.query(
          'INSERT INTO users (id, name, email, password_hash, role, created_at) VALUES ($1,$2,$3,$4,$5,$6)',
          [u.id, u.name, u.email, u.passwordHash, u.role, u.createdAt]
        );
      } catch (e) {
        if (e.code === '23505') throw Object.assign(new Error('Email already registered'), { code: 'EMAIL_TAKEN' });
        throw e;
      }
      return u;
    },

    async updateUser(id, patch) {
      const { rows } = await pool.query(
        `UPDATE users SET role = COALESCE($2, role), password_hash = COALESCE($3, password_hash),
                          last_login_at = COALESCE($4, last_login_at)
          WHERE id = $1 RETURNING ${USER_COLS}`,
        [id, patch.role ?? null, patch.passwordHash ?? null, patch.lastLoginAt ?? null]
      );
      return rows[0] ? toUser(rows[0]) : null;
    },

    async listUsers({ limit = 200 } = {}) {
      const { rows } = await pool.query(`SELECT ${USER_COLS} FROM users ORDER BY created_at DESC LIMIT $1`, [limit]);
      return rows.map(toUser);
    },

    async countUsersByRole() {
      const { rows } = await pool.query('SELECT role, count(*)::int AS n FROM users GROUP BY role');
      const out = { user: 0, admin: 0 };
      for (const r of rows) out[r.role] = r.n;
      return out;
    },

    async listOfficial() {
      const { rows } = await pool.query(
        `SELECT source_name, source_url, province, district, category, period, period_type, cases, is_sample, imported_at
           FROM official_stats`
      );
      return rows.map((r) => ({
        sourceName: r.source_name, sourceUrl: r.source_url, province: r.province, district: r.district,
        category: r.category, period: r.period, periodType: r.period_type, cases: r.cases,
        isSample: r.is_sample, importedAt: iso(r.imported_at),
      }));
    },

    async upsertOfficial(rows) {
      const client = await pool.connect();
      let inserted = 0;
      let updated = 0;
      try {
        await client.query('BEGIN');
        for (const r of rows) {
          const res = await client.query(
            `INSERT INTO official_stats (source_name, source_url, province, district, category, period, period_type, cases, is_sample)
             VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
             ON CONFLICT (source_name, province, district, category, period)
             DO UPDATE SET source_url = EXCLUDED.source_url, cases = EXCLUDED.cases,
                           period_type = EXCLUDED.period_type, is_sample = EXCLUDED.is_sample, imported_at = now()
             RETURNING (xmax = 0) AS inserted`,
            [r.sourceName, r.sourceUrl, r.province, r.district, r.category, r.period, r.periodType, r.cases, r.isSample]
          );
          if (res.rows[0].inserted) inserted += 1; else updated += 1;
        }
        await client.query('COMMIT');
      } catch (e) {
        await client.query('ROLLBACK');
        throw e;
      } finally {
        client.release();
      }
      return { inserted, updated };
    },
  };
}
