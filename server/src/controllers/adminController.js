import { getStore } from '../store/index.js';
import { checkAdminPassword, signToken } from '../services/auth.js';
import { config } from '../config.js';
import { httpError } from '../utils/httpError.js';
import { moderateReport, toAdminReport } from '../services/reportService.js';
import { REPORT_STATUSES } from '../../../shared/categories.js';

export function login(req, res) {
  if (!config.adminPassword) throw httpError(503, 'Admin access is not configured on this server (set ADMIN_PASSWORD).');
  if (!checkAdminPassword(req.body?.password ?? '')) throw httpError(401, 'Wrong password.');
  res.json({ token: signToken({ role: 'admin' }), expiresInMs: config.adminTokenTtlMs });
}

export async function listAdminReports(req, res) {
  const { status } = req.query;
  if (status && !REPORT_STATUSES.includes(status)) throw httpError(400, `status must be one of: ${REPORT_STATUSES.join(', ')}.`);
  const store = await getStore();
  const [rows, counts] = await Promise.all([
    store.listReports({ statuses: status ? [status] : undefined, limit: 200 }),
    store.countReportsByStatus(),
  ]);
  // Oldest pending first when reviewing, newest first otherwise (store already sorts newest first).
  const data = (status === 'pending' ? [...rows].reverse() : rows).map(toAdminReport);
  res.json({ count: data.length, counts, data });
}

export async function moderate(req, res) {
  const data = await moderateReport(req.params.id, req.body ?? {}, { store: await getStore() });
  res.json({ data });
}
