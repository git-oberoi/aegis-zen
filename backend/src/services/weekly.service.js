import { generateStructuredResponse } from './gemini.service.js';
import { WEEKLY_OPTIMIZER_RESPONSE_SCHEMA } from '../schemas/weekly.schema.js';
import { buildWeeklyOptimizerPrompt } from '../prompts/weekly.prompt.js';
import { parseHeuristicWeeklyOptimization } from '../heuristics/inbox.fallback.js';

export const optimizeWeek = async ({ tasks, habits, goals, apiKey }) => {
  try {
    const prompt = buildWeeklyOptimizerPrompt(tasks, habits, goals);
    return await generateStructuredResponse({ prompt, schema: WEEKLY_OPTIMIZER_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Weekly Optimizer Service] Falling back to heuristic:', err.message);
    return parseHeuristicWeeklyOptimization(tasks, habits, goals);
  }
};
