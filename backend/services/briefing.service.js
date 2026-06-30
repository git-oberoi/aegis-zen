import mongoose from 'mongoose';
import { generateStructuredResponse } from './gemini.service.js';
import { BRIEFING_RESPONSE_SCHEMA } from '../schemas/briefing.schema.js';
import { buildBriefingPrompt } from '../prompts/briefing.prompt.js';
import { parseHeuristicBriefing } from '../heuristics/inbox.fallback.js';
import { briefingCache } from '../utils/cache.utils.js';

import * as userRepository from '../repositories/user.repository.js';
import * as taskRepository from '../repositories/task.repository.js';
import * as habitRepository from '../repositories/habit.repository.js';
import * as aiHistoryRepository from '../repositories/aiHistory.repository.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const generateDailyBriefing = async ({ tasks, habits, history, selectedDate, apiKey, username }) => {
  const cacheKey = `briefing_${selectedDate}_${username || 'Demo User'}`;
  if (briefingCache[cacheKey]) {
    console.log('[Briefing Service] Resolving from daily cache:', cacheKey);
    return briefingCache[cacheKey];
  }

  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      // Sync incoming client tasks and habits into MongoDB collections in the background
      await taskRepository.syncTasks(user._id, tasks);
      await habitRepository.syncHabits(user._id, habits);
    } catch (dbErr) {
      console.warn('[Briefing Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildBriefingPrompt(tasks, habits, history, username);
  let result;
  
  try {
    result = await generateStructuredResponse({ prompt, schema: BRIEFING_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Briefing Service] Falling back to heuristic:', err.message);
    result = parseHeuristicBriefing(tasks, habits, history, username);
  }

  briefingCache[cacheKey] = result;

  // Log compiled prompt run into AI History collection
  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'briefing',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Briefing Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

