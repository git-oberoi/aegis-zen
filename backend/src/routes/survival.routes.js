import { Router } from 'express';
import { survival, simulate } from '../controllers/survival.controller.js';

const router = Router();

// POST /api/survival — Calculate emergency deadline survival statistics
router.post('/survival', survival);

// POST /api/simulate — Run Future Self simulation across 3 scenarios
router.post('/simulate', simulate);

export default router;
