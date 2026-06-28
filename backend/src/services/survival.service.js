import { generateStructuredResponse } from './gemini.service.js';
import { SURVIVAL_RESPONSE_SCHEMA } from '../schemas/survival.schema.js';
import { SIMULATION_RESPONSE_SCHEMA } from '../schemas/simulation.schema.js';
import { buildSurvivalPrompt } from '../prompts/survival.prompt.js';
import { buildSimulationPrompt } from '../prompts/simulation.prompt.js';
import { calculateHeuristicSurvival } from '../heuristics/survival.fallback.js';
import { calculateHeuristicSimulation } from '../heuristics/simulation.fallback.js';

export const computeSurvivalStats = async ({ tasks, events, apiKey }) => {
  try {
    const prompt = buildSurvivalPrompt();
    return await generateStructuredResponse({ prompt, schema: SURVIVAL_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Survival Service] Falling back to heuristic:', err.message);
    return calculateHeuristicSurvival(tasks);
  }
};

export const simulateFutureSelf = async ({ tasks, habits, apiKey }) => {
  try {
    const prompt = buildSimulationPrompt();
    return await generateStructuredResponse({ prompt, schema: SIMULATION_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Simulation Service] Falling back to heuristic:', err.message);
    return calculateHeuristicSimulation(tasks, habits);
  }
};
