import { Router } from 'express';
import { dailyBriefing } from '../controllers/briefing.controller.js';

const router = Router();

// POST /api/briefing — Generate personalized morning briefing for the day
router.post('/briefing', dailyBriefing);

export default router;
