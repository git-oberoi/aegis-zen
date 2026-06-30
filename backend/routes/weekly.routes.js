import { Router } from 'express';
import { weeklyOptimizer } from '../controllers/weekly.controller.js';

const router = Router();

// POST /api/optimize-week — Optimize entire week: focus, postpone, ignore recommendations
router.post('/optimize-week', weeklyOptimizer);

export default router;
