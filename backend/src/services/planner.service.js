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

export const generateSchedule = async ({ tasks, selectedDate, survivalModeActive, apiKey }) => {
  try {
    const prompt = buildPlannerPrompt(selectedDate, survivalModeActive);
    return await generateStructuredResponse({ prompt, schema: PLANNER_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Planner Service] Falling back to heuristic:', err.message);
    return generateHeuristicSchedule(tasks, selectedDate, survivalModeActive);
  }
};

export const generateReschedule = async ({ tasks, events, selectedDate, currentTime, apiKey }) => {
  try {
    const prompt = buildReschedulePrompt(currentTime, selectedDate);
    return await generateStructuredResponse({ prompt, schema: RESCHEDULE_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Reschedule Service] Falling back to heuristic:', err.message);
    return generateHeuristicReschedule(tasks, events, selectedDate, currentTime);
  }
};

export const generateRecovery = async ({ tasks, events, missedTask, apiKey }) => {
  try {
    const prompt = buildRecoveryPrompt(missedTask, tasks, events);
    return await generateStructuredResponse({ prompt, schema: RECOVERY_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Recovery Service] Falling back to heuristic:', err.message);
    return parseHeuristicRecovery(tasks, events, missedTask);
  }
};

export const estimateTask = async ({ title, description, apiKey }) => {
  const cacheKey = `${title.trim().toLowerCase()}_${(description || '').trim().toLowerCase()}`;
  if (estimationCache[cacheKey]) return estimationCache[cacheKey];

  try {
    const prompt = buildEstimatePrompt(title, description);
    const result = await generateStructuredResponse({ prompt, schema: ESTIMATION_RESPONSE_SCHEMA, apiKey });
    estimationCache[cacheKey] = result;
    return result;
  } catch (err) {
    console.error('[Estimate Service] Falling back to heuristic:', err.message);
    const fallback = parseHeuristicEstimate(title, description);
    estimationCache[cacheKey] = fallback;
    return fallback;
  }
};

export const recommendNext = async ({ tasks, energyLevel, apiKey }) => {
  try {
    const prompt = buildRecommendNextPrompt(energyLevel, tasks);
    return await generateStructuredResponse({ prompt, schema: NEXT_RECOMMENDATION_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Recommend Next Service] Falling back to heuristic:', err.message);
    return parseHeuristicRecommendNext(tasks, energyLevel);
  }
};
