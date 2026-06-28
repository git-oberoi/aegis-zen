import { Router } from 'express';
import { inboxAction, brainDump, voiceAccountability } from '../controllers/inbox.controller.js';

const router = Router();

// POST /api/inbox-action — Extract structured task from unstructured pasted text
router.post('/inbox-action', inboxAction);

// POST /api/braindump — Parse full brain dump into goals, tasks, and deadlines
router.post('/braindump', brainDump);

// POST /api/voice-accountability — Process voice check-in and decide next action
router.post('/voice-accountability', voiceAccountability);

export default router;
