import { config } from '../config.js';
import { verifyToken } from '../services/auth.js';
import { httpError } from '../utils/httpError.js';

/** Protects admin routes: needs "Authorization: Bearer <token>" from POST /api/admin/login. */
export function requireAdmin(req, _res, next) {
  if (!config.adminPassword) return next(httpError(503, 'Admin access is not configured on this server (set ADMIN_PASSWORD).'));
  const header = req.get('authorization') || '';
  const payload = header.startsWith('Bearer ') ? verifyToken(header.slice(7)) : null;
  if (!payload || payload.role !== 'admin') return next(httpError(401, 'Admin login required.'));
  req.admin = payload;
  next();
}
