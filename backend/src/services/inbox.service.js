import { generateStructuredResponse } from './gemini.service.js';
import { INBOX_RESPONSE_SCHEMA, BRAINDUMP_RESPONSE_SCHEMA, VOICE_ACCOUNTABILITY_RESPONSE_SCHEMA } from '../schemas/inbox.schema.js';
import { buildInboxPrompt, buildBrainDumpPrompt, buildVoiceAccountabilityPrompt } from '../prompts/inbox.prompt.js';
import {
  parseHeuristicInbox,
  parseHeuristicBrainDump,
  parseHeuristicVoiceAccountability
} from '../heuristics/inbox.fallback.js';

export const parseInboxAction = async ({ text, currentDate, apiKey }) => {
  try {
    const prompt = buildInboxPrompt(text, currentDate);
    return await generateStructuredResponse({ prompt, schema: INBOX_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Inbox Service] Falling back to heuristic:', err.message);
    return parseHeuristicInbox(text, currentDate);
  }
};

export const parseBrainDump = async ({ text, currentDate, apiKey }) => {
  try {
    const prompt = buildBrainDumpPrompt(text, currentDate);
    return await generateStructuredResponse({ prompt, schema: BRAINDUMP_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Brain Dump Service] Falling back to heuristic:', err.message);
    return parseHeuristicBrainDump(text, currentDate);
  }
};

export const processVoiceAccountability = async ({ taskTitle, userResponse, apiKey }) => {
  try {
    const prompt = buildVoiceAccountabilityPrompt(taskTitle, userResponse);
    return await generateStructuredResponse({ prompt, schema: VOICE_ACCOUNTABILITY_RESPONSE_SCHEMA, apiKey });
  } catch (err) {
    console.error('[Voice Accountability Service] Falling back to heuristic:', err.message);
    return parseHeuristicVoiceAccountability(taskTitle, userResponse);
  }
};
