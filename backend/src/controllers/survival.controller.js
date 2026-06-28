import { resolveApiKey } from '../services/gemini.service.js';
import { computeSurvivalStats, simulateFutureSelf } from '../services/survival.service.js';

export const survival = async (req, res) => {
  const { tasks, events } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await computeSurvivalStats({ tasks, events, apiKey });
  res.json(result);
};

export const simulate = async (req, res) => {
  const { tasks, habits } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await simulateFutureSelf({ tasks, habits, apiKey });
  res.json(result);
};
