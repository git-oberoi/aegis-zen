import mongoose from 'mongoose';
import { generateStructuredResponse } from './gemini.service.js';
import {
  PLANNER_RESPONSE_SCHEMA,
  RESCHEDULE_RESPONSE_SCHEMA,
  RECOVERY_RESPONSE_SCHEMA,
  ESTIMATION_RESPONSE_SCHEMA,
  NEXT_RECOMMENDATION_RESPONSE_SCHEMA
} from '../schemas/planner.schema.js';
import {
  buildPlannerPrompt,
  buildReschedulePrompt,
  buildRecoveryPrompt,
  buildEstimatePrompt,
  buildRecommendNextPrompt
} from '../prompts/planner.prompt.js';
import {
  generateHeuristicSchedule,
  generateHeuristicReschedule,
  parseHeuristicRecovery,
  parseHeuristicEstimate,
  parseHeuristicRecommendNext
} from '../heuristics/planner.fallback.js';
import { estimationCache } from '../utils/cache.utils.js';

import * as userRepository from '../repositories/user.repository.js';
import * as taskRepository from '../repositories/task.repository.js';
import * as aiHistoryRepository from '../repositories/aiHistory.repository.js';
import * as plannerRepository from '../repositories/planner.repository.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const generateSchedule = async ({ tasks, selectedDate, survivalModeActive, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
    } catch (dbErr) {
      console.warn('[Planner Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildPlannerPrompt(selectedDate, survivalModeActive);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: PLANNER_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Planner Service] Falling back to heuristic:', err.message);
    result = generateHeuristicSchedule(tasks, selectedDate, survivalModeActive);
  }

  if (isDbConnected() && user) {
    try {
      // 1. Save AI Generated Schedule to Planner collection
      await plannerRepository.savePlanner(user._id, {
        date: selectedDate,
        tasks: result.schedule || [],
        focusScore: 0
      });

      // 2. Log run in AI History
      await aiHistoryRepository.create({
        feature: 'planner',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Planner Service DB Logging/Saving Warning]', logErr.message);
    }
  }

  return result;
};

export const generateReschedule = async ({ tasks, events, selectedDate, currentTime, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
    } catch (dbErr) {
      console.warn('[Reschedule Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildReschedulePrompt(currentTime, selectedDate);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: RESCHEDULE_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Reschedule Service] Falling back to heuristic:', err.message);
    result = generateHeuristicReschedule(tasks, events, selectedDate, currentTime);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'reschedule',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Reschedule Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

export const generateRecovery = async ({ tasks, events, missedTask, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
    } catch (dbErr) {
      console.warn('[Recovery Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildRecoveryPrompt(missedTask, tasks, events);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: RECOVERY_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Recovery Service] Falling back to heuristic:', err.message);
    result = parseHeuristicRecovery(tasks, events, missedTask);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'recovery',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Recovery Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

export const estimateTask = async ({ title, description, apiKey }) => {
  const cacheKey = `${title.trim().toLowerCase()}_${(description || '').trim().toLowerCase()}`;
  if (estimationCache[cacheKey]) return estimationCache[cacheKey];

  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
    } catch (dbErr) {
      console.warn('[Estimate Service DB User Warning]', dbErr.message);
    }
  }

  const prompt = buildEstimatePrompt(title, description);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: ESTIMATION_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Estimate Service] Falling back to heuristic:', err.message);
    result = parseHeuristicEstimate(title, description);
  }

  estimationCache[cacheKey] = result;

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'estimate-task',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Estimate Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

export const recommendNext = async ({ tasks, energyLevel, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
    } catch (dbErr) {
      console.warn('[Recommend Next Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildRecommendNextPrompt(energyLevel, tasks);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: NEXT_RECOMMENDATION_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Recommend Next Service] Falling back to heuristic:', err.message);
    result = parseHeuristicRecommendNext(tasks, energyLevel);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'recommend-next',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Recommend Next Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

