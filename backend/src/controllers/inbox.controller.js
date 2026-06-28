import { resolveApiKey } from '../services/gemini.service.js';
import { parseInboxAction, parseBrainDump, processVoiceAccountability } from '../services/inbox.service.js';

export const inboxAction = async (req, res) => {
  const { text, currentDate } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await parseInboxAction({ text, currentDate, apiKey });
  res.json(result);
};

export const brainDump = async (req, res) => {
  const { text, currentDate } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await parseBrainDump({ text, currentDate, apiKey });
  res.json(result);
};

export const voiceAccountability = async (req, res) => {
  const { taskTitle, userResponse } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await processVoiceAccountability({ taskTitle, userResponse, apiKey });
  res.json(result);
};
