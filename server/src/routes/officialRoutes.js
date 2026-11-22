import { Router } from 'express';
import { summary } from '../controllers/officialController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';

const router = Router();
router.get('/summary', asyncHandler(summary)); // GET /api/official/summary?source=&periodType=&province=&district=&category=&from=&to=

export default router;
