import { resolveApiKey } from '../services/gemini.service.js';
import { predictBurnout, assessCognitiveLoad } from '../services/burnout.service.js';

export const burnout = async (req, res) => {
  const { tasks, events, habits } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await predictBurnout({ tasks, events, habits, apiKey });
  res.json(result);
};

export const cognitiveLoad = async (req, res) => {
  const { tasks, events } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await assessCognitiveLoad({ tasks, events, apiKey });
  res.json(result);
};
