import { Router } from 'express';
import { createReport, listReports } from '../controllers/communityController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.get('/', asyncHandler(listReports)); // GET /api/community-reports?status=&city=&category=
router.post('/', rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(createReport)); // POST /api/community-reports

export default router;
