/** Central place for environment-driven settings. */
import { randomBytes } from 'node:crypto';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));

export const config = {
  port: Number(process.env.PORT) || 5000,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  geminiApiKey: process.env.GEMINI_API_KEY || '',
  geminiModel: process.env.GEMINI_MODEL || 'gemini-3.5-flash',
  geminiTimeoutMs: 30000,
  adviceCacheMs: 10 * 60 * 1000,

  // ---- Data storage ----
  // With DATABASE_URL set the app uses PostgreSQL; without it, a JSON file in dataDir.
  databaseUrl: process.env.DATABASE_URL || '',
  dataDir: process.env.DATA_DIR || path.resolve(here, '../data'),

  // ---- Admin access ----
  // No ADMIN_PASSWORD = admin endpoints are switched off (there is no default password).
  adminPassword: process.env.ADMIN_PASSWORD || '',
  // Random per process if unset: admin sessions then end whenever the server restarts.
  authSecret: process.env.AUTH_SECRET || randomBytes(32).toString('hex'),
  adminTokenTtlMs: 8 * 60 * 60 * 1000,
};
