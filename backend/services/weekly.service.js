import mongoose from 'mongoose';
import { generateStructuredResponse } from './gemini.service.js';
import { WEEKLY_OPTIMIZER_RESPONSE_SCHEMA } from '../schemas/weekly.schema.js';
import { buildWeeklyOptimizerPrompt } from '../prompts/weekly.prompt.js';
import { parseHeuristicWeeklyOptimization } from '../heuristics/inbox.fallback.js';

import * as userRepository from '../repositories/user.repository.js';
import * as taskRepository from '../repositories/task.repository.js';
import * as habitRepository from '../repositories/habit.repository.js';
import * as aiHistoryRepository from '../repositories/aiHistory.repository.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const optimizeWeek = async ({ tasks, habits, goals, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
      await habitRepository.syncHabits(user._id, habits);
    } catch (dbErr) {
      console.warn('[Weekly Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildWeeklyOptimizerPrompt(tasks, habits, goals);
  let result;


  try {
    result = await generateStructuredResponse({ prompt, schema: WEEKLY_OPTIMIZER_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Weekly Service] Falling back to heuristic:', err.message);
    result = parseHeuristicWeeklyOptimization(tasks, habits, goals);
  }


  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'weekly-optimizer',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Weekly Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};
