import mongoose from 'mongoose';
import { generateStructuredResponse } from './gemini.service.js';
import { INBOX_RESPONSE_SCHEMA, BRAINDUMP_RESPONSE_SCHEMA, VOICE_ACCOUNTABILITY_RESPONSE_SCHEMA } from '../schemas/inbox.schema.js';
import { buildInboxPrompt, buildBrainDumpPrompt, buildVoiceAccountabilityPrompt } from '../prompts/inbox.prompt.js';
import {
  parseHeuristicInbox,
  parseHeuristicBrainDump,
  parseHeuristicVoiceAccountability
} from '../heuristics/inbox.fallback.js';

import * as userRepository from '../repositories/user.repository.js';
import * as aiHistoryRepository from '../repositories/aiHistory.repository.js';
import * as brainDumpRepository from '../repositories/brainDump.repository.js';

const isDbConnected = () => mongoose.connection.readyState === 1;

export const parseInboxAction = async ({ text, currentDate, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
    } catch (dbErr) {
      console.warn('[Inbox Service DB Resolved Warning]', dbErr.message);
    }
  }

  const prompt = buildInboxPrompt(text, currentDate);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: INBOX_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Inbox Service] Falling back to heuristic:', err.message);
    result = parseHeuristicInbox(text, currentDate);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'inbox-action',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Inbox Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

export const parseBrainDump = async ({ text, currentDate, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
    } catch (dbErr) {
      console.warn('[Brain Dump Service DB Resolved Warning]', dbErr.message);
    }
  }

  const prompt = buildBrainDumpPrompt(text, currentDate);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: BRAINDUMP_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Brain Dump Service] Falling back to heuristic:', err.message);
    result = parseHeuristicBrainDump(text, currentDate);
  }

  if (isDbConnected() && user) {
    try {
      // 1. Save Extracted Brain Dump details in DB
      await brainDumpRepository.create({
        rawInput: text,
        extractedTasks: result.tasks || [],
        extractedGoals: result.goals || [],
        extractedDeadlines: result.deadlines || [],
        aiSummary: result.risks ? result.risks.join(', ') : '',
        userId: user._id
      });

      // 2. Log run in AI History
      await aiHistoryRepository.create({
        feature: 'braindump',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Brain Dump Service DB Logging/Saving Warning]', logErr.message);
    }
  }

  return result;
};

export const processVoiceAccountability = async ({ taskTitle, userResponse, apiKey }) => {
  let user = null;
  if (isDbConnected()) {
    try {
      user = await userRepository.findOrCreateDemoUser();
    } catch (dbErr) {
      console.warn('[Voice Accountability Service DB Resolved Warning]', dbErr.message);
    }
  }

  const prompt = buildVoiceAccountabilityPrompt(taskTitle, userResponse);
  let result;

  try {
    result = await generateStructuredResponse({ prompt, schema: VOICE_ACCOUNTABILITY_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Voice Accountability Service] Falling back to heuristic:', err.message);
    result = parseHeuristicVoiceAccountability(taskTitle, userResponse);
  }

  if (isDbConnected() && user) {
    try {
      await aiHistoryRepository.create({
        feature: 'voice-accountability',
        prompt,
        response: result,
        userId: user._id
      });
    } catch (logErr) {
      console.warn('[Voice Accountability Service DB Logging Warning]', logErr.message);
    }
  }

  return result;
};

