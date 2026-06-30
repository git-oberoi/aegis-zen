import { Router } from 'express';
import { burnout, cognitiveLoad } from '../controllers/burnout.controller.js';

const router = Router();

// POST /api/burnout — Predict workload burnout score and mindful recommendations
router.post('/burnout', burnout);

// POST /api/cognitive-load — Measure real-time mental workload and generate advice
router.post('/cognitive-load', cognitiveLoad);

export default router;
