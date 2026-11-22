import { Router } from 'express';
import { stats, recentReports, overview } from '../controllers/insightController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/stats', stats); // GET /api/stats (sample map data)
router.get('/reports/recent', recentReports); // GET /api/reports/recent?limit=6 (sample map data)
router.get('/overview', asyncHandler(overview)); // GET /api/overview

export default router;
