import { Router } from 'express';
import { login, me, signup } from '../controllers/authController.js';
import { asyncHandler } from '../middleware/asyncHandler.js';
import { rateLimit } from '../middleware/rateLimit.js';
import { requireAuth } from '../middleware/requireAuth.js';

const router = Router();
router.post('/signup', rateLimit({ windowMs: 60_000, max: 5 }), asyncHandler(signup)); // POST /api/auth/signup
router.post('/login', rateLimit({ windowMs: 60_000, max: 10 }), asyncHandler(login)); // POST /api/auth/login
router.get('/me', requireAuth, me); // GET /api/auth/me

export default router;
