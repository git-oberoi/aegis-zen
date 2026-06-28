import { resolveApiKey } from '../services/gemini.service.js';
import { generateDailyBriefing } from '../services/briefing.service.js';

export const dailyBriefing = async (req, res) => {
  const { tasks, habits, history, selectedDate } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await generateDailyBriefing({ tasks, habits, history, selectedDate, apiKey });
  res.json(result);
};
