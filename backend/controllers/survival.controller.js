import { asyncHandler } from '../middleware/asyncHandler.js';
import { computeSurvivalStats, simulateFutureSelf } from '../services/survival.service.js';

export const survival = asyncHandler(async (req, res) => {
  const { tasks, events } = req.body;
  const { apiKey } = req;
  const result = await computeSurvivalStats({ tasks, events, apiKey });
  res.json(result);
});

export const simulate = asyncHandler(async (req, res) => {
  const { tasks, habits } = req.body;
  const { apiKey } = req;
  const result = await simulateFutureSelf({ tasks, habits, apiKey });
  res.json(result);
});

