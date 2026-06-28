import { generateStructuredResponse } from './gemini.service.js';
import { BURNOUT_RESPONSE_SCHEMA } from '../schemas/burnout.schema.js';
import { COGNITIVE_LOAD_RESPONSE_SCHEMA } from '../schemas/cognitive.schema.js';
import { buildBurnoutPrompt, buildCognitiveLoadPrompt } from '../prompts/burnout.prompt.js';
import { calculateHeuristicBurnout, parseHeuristicCognitiveLoad } from '../heuristics/burnout.fallback.js';

export const predictBurnout = async ({ tasks, events, habits, apiKey }) => {
  try {
    const prompt = buildBurnoutPrompt();
    return await generateStructuredResponse({ prompt, schema: BURNOUT_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Burnout Service] Falling back to heuristic:', err.message);
    return calculateHeuristicBurnout(tasks, events, habits);
  }
};

export const assessCognitiveLoad = async ({ tasks, events, apiKey }) => {
  try {
    const prompt = buildCognitiveLoadPrompt(tasks, events);
    return await generateStructuredResponse({ prompt, schema: COGNITIVE_LOAD_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Cognitive Load Service] Falling back to heuristic:', err.message);
    return parseHeuristicCognitiveLoad(tasks, events);
  }
};
