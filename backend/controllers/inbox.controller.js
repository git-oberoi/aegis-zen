import { asyncHandler } from '../middleware/asyncHandler.js';
import { parseInboxAction, parseBrainDump, processVoiceAccountability } from '../services/inbox.service.js';

export const inboxAction = asyncHandler(async (req, res) => {
  const { text, currentDate } = req.body;
  const { apiKey } = req;
  const result = await parseInboxAction({ text, currentDate, apiKey });
  res.json(result);
});

export const brainDump = asyncHandler(async (req, res) => {
  const { text, currentDate } = req.body;
  const { apiKey } = req;
  const result = await parseBrainDump({ text, currentDate, apiKey });
  res.json(result);
});

export const voiceAccountability = asyncHandler(async (req, res) => {
  const { taskTitle, userResponse } = req.body;
  const { apiKey } = req;
  const result = await processVoiceAccountability({ taskTitle, userResponse, apiKey });
  res.json(result);
});

