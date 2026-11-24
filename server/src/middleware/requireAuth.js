import { getStore } from '../store/index.js';
import { authenticate } from '../services/userService.js';
import { httpError } from '../utils/httpError.js';

/** Needs "Authorization: Bearer <token>" from /api/auth/login or /signup. Sets req.user. */
export async function requireAuth(req, _res, next) {
  try {
    const header = req.get('authorization') || '';
    const user = header.startsWith('Bearer ') ? await authenticate(header.slice(7), { store: await getStore() }) : null;
    if (!user) return next(httpError(401, 'Please sign in.'));
    req.user = user;
    next();
  } catch (e) {
    next(e);
  }
}
