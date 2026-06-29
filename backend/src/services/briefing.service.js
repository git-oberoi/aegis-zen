import { generateStructuredResponse } from './gemini.service.js';
import { BRIEFING_RESPONSE_SCHEMA } from '../schemas/briefing.schema.js';
import { buildBriefingPrompt } from '../prompts/briefing.prompt.js';
import { parseHeuristicBriefing } from '../heuristics/inbox.fallback.js';
import { briefingCache } from '../utils/cache.utils.js';

export const generateDailyBriefing = async ({ tasks, habits, history, selectedDate, apiKey, username }) => {
  const cacheKey = `briefing_${selectedDate}_${username || 'Demo User'}`;
  if (briefingCache[cacheKey]) {
    console.log('[Briefing Service] Resolving from daily cache:', cacheKey);
    return briefingCache[cacheKey];
  }

  try {
    const prompt = buildBriefingPrompt(tasks, habits, history, username);
    const result = await generateStructuredResponse({ prompt, schema: BRIEFING_RESPONSE_SCHEMA, apiKey });
    briefingCache[cacheKey] = result;
    return result;
  } catch (err) {
    console.error('[Briefing Service] Falling back to heuristic:', err.message);
    const fallback = parseHeuristicBriefing(tasks, habits, history, username);
    briefingCache[cacheKey] = fallback;
    return fallback;
  }
};
