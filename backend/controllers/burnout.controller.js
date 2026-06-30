import { asyncHandler } from '../middleware/asyncHandler.js';
import { predictBurnout, assessCognitiveLoad } from '../services/burnout.service.js';

export const burnout = asyncHandler(async (req, res) => {
  const { tasks, events, habits } = req.body;
  const { apiKey } = req;
  const result = await predictBurnout({ tasks, events, habits, apiKey });
  res.json(result);
});

export const cognitiveLoad = asyncHandler(async (req, res) => {
  const { tasks, events } = req.body;
  const { apiKey } = req;
  const result = await assessCognitiveLoad({ tasks, events, apiKey });
  res.json(result);
});

