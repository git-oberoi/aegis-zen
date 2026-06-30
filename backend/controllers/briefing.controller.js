import { asyncHandler } from '../middleware/asyncHandler.js';
import { generateDailyBriefing } from '../services/briefing.service.js';

export const dailyBriefing = asyncHandler(async (req, res) => {
  const { tasks, habits, history, selectedDate, username } = req.body;
  const { apiKey } = req;
  const result = await generateDailyBriefing({ tasks, habits, history, selectedDate, apiKey, username });
  res.json(result);
});

