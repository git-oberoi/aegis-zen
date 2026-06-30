import mongoose from 'mongoose';
import { generateStructuredResponse } from './gemini.service.js';
import { SURVIVAL_RESPONSE_SCHEMA } from '../schemas/survival.schema.js';
import { SIMULATION_RESPONSE_SCHEMA } from '../schemas/simulation.schema.js';
import { buildSurvivalPrompt } from '../prompts/survival.prompt.js';
import { buildSimulationPrompt } from '../prompts/simulation.prompt.js';
import { calculateHeuristicSurvival } from '../heuristics/survival.fallback.js';
import { calculateHeuristicSimulation } from '../heuristics/simulation.fallback.js';

import * as userRepository from '../repositories/user.repository.js';
import * as taskRepository from '../repositories/task.repository.js';
import * as habitRepository from '../repositories/habit.repository.js';
import * as aiHistoryRepository from '../repositories/aiHistory.repository.js';
import * as futureSimulationRepository from '../repositories/futureSimulation.repository.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const computeSurvivalStats = async ({ tasks, events, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
    } catch (dbErr) {
      console.warn('[Survival Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildSurvivalPrompt();
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: SURVIVAL_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Survival Service] Falling back to heuristic:', err.message);
    result = calculateHeuristicSurvival(tasks);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'survival',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Survival Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

export const simulateFutureSelf = async ({ tasks, habits, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
      await taskRepository.syncTasks(user._id, tasks);
      await habitRepository.syncHabits(user._id, habits);
    } catch (dbErr) {
      console.warn('[Simulation Service DB Sync Warning]', dbErr.message);
    }
  }

  const prompt = buildSimulationPrompt();
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: SIMULATION_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Simulation Service] Falling back to heuristic:', err.message);
    result = calculateHeuristicSimulation(tasks, habits);
  }

  if (isDbConnected() && user) {
    try {
      // 1. Save Future Simulation to DB
      await futureSimulationRepository.create({
        scenario: {
          scenarioA: result.scenarioA,
          scenarioB: result.scenarioB,
          scenarioC: result.scenarioC,
          scenarioD: result.scenarioD
        },
        recommendation: result.mindfulCoachAdvice || '',
        completionProbability: result.scenarioA ? result.scenarioA.completionProbability : 50,
        generatedAt: new Date(),
        userId: user._id
      });

      // 2. Log run in AI History
      await aiHistoryRepository.create({
        feature: 'simulation',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Simulation Service DB Logging/Saving Warning]', logErr.message);
    }
  }

  return result;
};

