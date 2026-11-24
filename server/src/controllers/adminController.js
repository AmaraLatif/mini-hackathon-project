import { getStore } from '../store/index.js';
import { httpError } from '../utils/httpError.js';
import { moderateReport, toAdminReport } from '../services/reportService.js';
import * as users from '../services/userService.js';
import { REPORT_STATUSES } from '../../../shared/categories.js';

/** Same credentials as /api/auth/login, but only admins get a token here. */
export async function login(req, res) {
  const session = await users.login(req.body ?? {}, { store: await getStore() });
  if (session.user.role !== 'admin') throw httpError(403, 'This account is not an admin.');
  res.json(session);
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

export async function listUsers(_req, res) {
  const store = await getStore();
  const [data, counts] = await Promise.all([users.listUsers({ store }), store.countUsersByRole()]);
  res.json({ count: data.length, counts, data });
}

export async function changeRole(req, res) {
  const data = await users.setUserRole(req.user, req.params.id, req.body?.role, { store: await getStore() });
  res.json({ data });
}
