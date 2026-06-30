import mongoose from 'mongoose';
import { generateStructuredResponse } from './gemini.service.js';
import { BURNOUT_RESPONSE_SCHEMA } from '../schemas/burnout.schema.js';
import { COGNITIVE_LOAD_RESPONSE_SCHEMA } from '../schemas/cognitive.schema.js';
import { buildBurnoutPrompt, buildCognitiveLoadPrompt } from '../prompts/burnout.prompt.js';
import { calculateHeuristicBurnout, parseHeuristicCognitiveLoad } from '../heuristics/burnout.fallback.js';

import * as userRepository from '../repositories/user.repository.js';
import * as taskRepository from '../repositories/task.repository.js';
import * as habitRepository from '../repositories/habit.repository.js';
import * as aiHistoryRepository from '../repositories/aiHistory.repository.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const predictBurnout = async ({ tasks, events, habits, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
      await habitRepository.syncHabits(user._id, habits);
    } catch (dbErr) {
      console.warn('[Burnout Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildBurnoutPrompt();
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: BURNOUT_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Burnout Service] Falling back to heuristic:', err.message);
    result = calculateHeuristicBurnout(tasks, events, habits);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'burnout',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Burnout Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

export const assessCognitiveLoad = async ({ tasks, events, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
    } catch (dbErr) {
      console.warn('[Cognitive Load Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildCognitiveLoadPrompt(tasks, events);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: COGNITIVE_LOAD_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Cognitive Load Service] Falling back to heuristic:', err.message);
    result = parseHeuristicCognitiveLoad(tasks, events);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'cognitive-load',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Cognitive Load Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

