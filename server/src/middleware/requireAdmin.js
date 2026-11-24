import { requireAuth } from './requireAuth.js';
import { httpError } from '../utils/httpError.js';

/** Protects admin routes: a signed-in user whose CURRENT role is "admin". 401 = not signed in, 403 = signed in but not admin. */
export function requireAdmin(req, res, next) {
  requireAuth(req, res, (err) => {
    if (err) return next(err);
    if (req.user.role !== 'admin') return next(httpError(403, 'Admin access only.'));
    req.admin = req.user;
    next();
  });
}
