import { Router } from 'express';
import { getAdvice } from '../controllers/advisorController.js';
import { rateLimit } from '../middleware/rateLimit.js';

const router = Router();
router.get('/:id', rateLimit({ windowMs: 60_000, max: 30 }), getAdvice); // GET /api/advisor/:id

export default router;
