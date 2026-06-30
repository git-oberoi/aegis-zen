import { Router } from 'express';
import { planDay, reschedule, recover, estimate, recommendNextTask } from '../controllers/planner.controller.js';

const router = Router();

// POST /api/planner — Generate optimized daily schedule
router.post('/planner', planDay);

// POST /api/reschedule — Detect overdue events and suggest reschedule actions
router.post('/reschedule', reschedule);

// POST /api/recovery — Generate a recovery plan for a missed/overdue task
router.post('/recovery', recover);

// POST /api/estimate-task — AI-powered task duration and complexity estimation
router.post('/estimate-task', estimate);

// POST /api/recommend-next — Recommend the single best next task to work on
router.post('/recommend-next', recommendNextTask);

export default router;
