import { resolveApiKey } from '../services/gemini.service.js';
import { optimizeWeek } from '../services/weekly.service.js';

export const weeklyOptimizer = async (req, res) => {
  const { tasks, habits, goals } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await optimizeWeek({ tasks, habits, goals, apiKey });
  res.json(result);
};
