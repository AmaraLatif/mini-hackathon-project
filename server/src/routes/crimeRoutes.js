import { Router } from 'express';
import { listCrimes, getCrime } from '../controllers/crimeController.js';

const router = Router();
router.get('/', listCrimes); // GET /api/crimes?city=&risk=&type=&q=
router.get('/:id', getCrime); // GET /api/crimes/:id

export default router;
