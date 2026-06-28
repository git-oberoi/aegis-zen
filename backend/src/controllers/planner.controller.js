import { resolveApiKey } from '../services/gemini.service.js';
import {
  generateSchedule,
  generateReschedule,
  generateRecovery,
  estimateTask,
  recommendNext
} from '../services/planner.service.js';

export const planDay = async (req, res) => {
  const { tasks, selectedDate, survivalModeActive } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await generateSchedule({ tasks, selectedDate, survivalModeActive, apiKey });
  res.json(result);
};

export const reschedule = async (req, res) => {
  const { tasks, events, selectedDate, currentTime } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await generateReschedule({ tasks, events, selectedDate, currentTime, apiKey });
  res.json(result);
};

export const recover = async (req, res) => {
  const { tasks, events, missedTask } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await generateRecovery({ tasks, events, missedTask, apiKey });
  res.json(result);
};

export const estimate = async (req, res) => {
  const { title, description } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await estimateTask({ title, description, apiKey });
  res.json(result);
};

export const recommendNextTask = async (req, res) => {
  const { tasks, energyLevel } = req.body;
  const apiKey = resolveApiKey(req);
  const result = await recommendNext({ tasks, energyLevel, apiKey });
  res.json(result);
};
