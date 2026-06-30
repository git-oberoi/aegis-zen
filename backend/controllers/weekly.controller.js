import { asyncHandler } from '../middleware/asyncHandler.js';
import { optimizeWeek } from '../services/weekly.service.js';

export const weeklyOptimizer = asyncHandler(async (req, res) => {
  const { tasks, habits, goals } = req.body;
  const { apiKey } = req;
  const result = await optimizeWeek({ tasks, habits, goals, apiKey });
  res.json(result);
});

