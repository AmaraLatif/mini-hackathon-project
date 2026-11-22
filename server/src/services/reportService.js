/**
 * reportService.js - community reports: validation, abuse control, duplicate
 * flagging and moderation. Reports are NEVER merged into official statistics.
 */
import { createHash, randomUUID } from 'node:crypto';
import { PAKISTAN_BOUNDS, REPORT_CATEGORIES } from '../../../shared/categories.js';
import { config } from '../config.js';
import { httpError } from '../utils/httpError.js';

export const PUBLIC_STATUSES = ['pending', 'verified'];
const DAY_MS = 24 * 60 * 60 * 1000;

const clean = (v) => String(v ?? '').replace(/[\u0000-\u001f\u007f]/g, ' ').replace(/\s+/g, ' ').trim();
const norm = (v) => clean(v).toLowerCase();
const isBlank = (v) => v === undefined || v === null || v === '';
const hashIp = (ip) => createHash('sha256').update(`${config.authSecret}|${ip || 'unknown'}`).digest('hex').slice(0, 32);

/** Returns { ok, value, errors } - errors is { field: message }. */
export function validateReport(input = {}, now = new Date()) {
  const errors = {};
  const city = clean(input.city);
  const area = clean(input.area);
  const category = clean(input.category);
  const description = clean(input.description);
  const contact = clean(input.contact);
  const incidentDate = clean(input.incidentDate);

  if (city.length < 2 || city.length > 60) errors.city = 'City must be 2-60 characters.';
  if (area.length < 2 || area.length > 80) errors.area = 'Area must be 2-80 characters.';
  if (!REPORT_CATEGORIES.includes(category)) errors.category = 'Choose one of the listed categories.';
  if (description.length < 20 || description.length > 1000) errors.description = 'Describe what happened in 20-1000 characters.';
  if (contact.length > 100) errors.contact = 'Contact must be at most 100 characters.';

  const when = /^\d{4}-\d{2}-\d{2}$/.test(incidentDate) ? Date.parse(`${incidentDate}T00:00:00Z`) : NaN;
  if (Number.isNaN(when) || new Date(when).toISOString().slice(0, 10) !== incidentDate) {
    errors.incidentDate = 'Use a valid date (YYYY-MM-DD).';
  } else if (when > now.getTime() + DAY_MS) {
    errors.incidentDate = 'The incident date cannot be in the future.';
  } else if (when < now.getTime() - 365 * DAY_MS) {
    errors.incidentDate = 'Reports older than one year are not accepted.';
  }

  let latitude = null;
  let longitude = null;
  if (!isBlank(input.latitude) || !isBlank(input.longitude)) {
    latitude = Number(input.latitude);
    longitude = Number(input.longitude);
    const { minLat, maxLat, minLng, maxLng } = PAKISTAN_BOUNDS;
    const okLat = Number.isFinite(latitude) && latitude >= minLat && latitude <= maxLat;
    const okLng = Number.isFinite(longitude) && longitude >= minLng && longitude <= maxLng;
    if (!okLat || !okLng) { errors.location = 'Coordinates must be inside Pakistan.'; latitude = longitude = null; }
  }

  return {
    ok: Object.keys(errors).length === 0,
    errors,
    value: { city, area, category, description, incidentDate, latitude, longitude, contact: contact || null },
  };
}

/** Creates a PENDING report. Possible duplicates are flagged for the admin, not rejected. */
export async function submitReport(input, { ip } = {}, { store, now = new Date() } = {}) {
  if (clean(input?.website)) return { ignored: true }; // honeypot field: real users never fill it

  const { ok, errors, value } = validateReport(input, now);
  if (!ok) throw httpError(400, 'Please fix the highlighted fields.', { fields: errors });

  const ipHash = hashIp(ip);
  const recent = await store.listReports({ limit: 300 });

  if (recent.some((r) => r.ipHash === ipHash && now - Date.parse(r.createdAt) < 60_000)) {
    throw httpError(429, 'Please wait a minute before sending another report.');
  }

  const duplicate = recent.find(
    (r) =>
      r.status !== 'rejected' &&
      norm(r.city) === norm(value.city) &&
      norm(r.area) === norm(value.area) &&
      r.category === value.category &&
      now - Date.parse(r.createdAt) < DAY_MS
  );

  const report = await store.insertReport({
    id: randomUUID(),
    ...value,
    status: 'pending',
    duplicateOf: duplicate?.id ?? null,
    moderationNote: null,
    moderatedAt: null,
    ipHash,
    createdAt: now.toISOString(),
  });
  return { report };
}

/** What the public may see: no contact details, no moderation internals, no IP hash. */
export function toPublicReport(r) {
  const { id, city, area, category, description, incidentDate, latitude, longitude, status, createdAt } = r;
  return { id, city, area, category, description, incidentDate, latitude, longitude, status, createdAt };
}

/** Admin view: everything except the IP hash. */
export function toAdminReport({ ipHash, ...rest }) {
  return rest;
}

export async function listPublicReports({ status, city, category, limit } = {}, { store }) {
  if (status && !PUBLIC_STATUSES.includes(status)) throw httpError(400, 'status must be "pending" or "verified".');
  const rows = await store.listReports({
    statuses: status ? [status] : PUBLIC_STATUSES,
    city: city || undefined,
    category: category || undefined,
    limit: Math.min(Math.max(Number(limit) || 50, 1), 200),
  });
  return rows.map(toPublicReport);
}

export async function moderateReport(id, { status, note } = {}, { store, now = new Date() }) {
  if (!['verified', 'rejected', 'pending'].includes(status)) throw httpError(400, 'status must be verified, rejected or pending.');
  const moderationNote = clean(note).slice(0, 300) || null;
  const updated = await store.updateReport(id, {
    status,
    moderationNote,
    moderatedAt: status === 'pending' ? null : now.toISOString(),
  });
  if (!updated) throw httpError(404, 'Report not found.');
  return toAdminReport(updated);
}
