import { Router } from 'express';
import { changeRole, listAdminReports, listUsers, login, moderate } from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();
router.post('/login', rateLimit({ windowMs: 60_000, max: 5 }), asyncHandler(login)); // POST /api/admin/login {email, password}
router.get('/reports', requireAdmin, asyncHandler(listAdminReports)); // GET /api/admin/reports?status=
router.patch('/reports/:id', requireAdmin, asyncHandler(moderate)); // PATCH /api/admin/reports/:id
router.get('/users', requireAdmin, asyncHandler(listUsers)); // GET /api/admin/users
router.patch('/users/:id/role', requireAdmin, asyncHandler(changeRole)); // PATCH /api/admin/users/:id/role {role}

export default router;
