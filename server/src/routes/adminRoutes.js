import { Router } from 'express';
import { listAdminReports, login, moderate } from '../controllers/adminController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireAdmin } from '../middleware/requireAdmin.js';

const router = Router();
router.post('/login', rateLimit({ windowMs: 60_000, max: 5 }), asyncHandler(login)); // POST /api/admin/login
router.get('/reports', requireAdmin, asyncHandler(listAdminReports)); // GET /api/admin/reports?status=
router.patch('/reports/:id', requireAdmin, asyncHandler(moderate)); // PATCH /api/admin/reports/:id

export default router;
