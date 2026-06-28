import { GoogleGenerativeAI } from '@google/generative-ai';

const MODEL_NAME = 'gemini-1.5-flash';

/**
 * Central Gemini AI helper used by every feature service.
 * No feature should directly initialize GoogleGenerativeAI — all calls go here.
 *
 * @param {object} opts
 * @param {string} opts.prompt     - The fully-built prompt string
 * @param {object} opts.schema     - Gemini responseSchema object
 * @param {string} opts.apiKey     - Gemini API key from request header or env
 * @returns {Promise<object>}      - Parsed JSON response from Gemini
 */
export const generateStructuredResponse = async ({ prompt, schema, apiKey }) => {
  if (!apiKey || apiKey === 'undefined' || apiKey.trim() === '') {
    throw new Error('NO_API_KEY');
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: 'application/json',
      responseSchema: schema
    }
  });

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  return JSON.parse(responseText);
};

/**
 * Read the Gemini API key from the request headers or environment variable.
 * @param {object} req - Express request object
 * @returns {string}
 */
export const resolveApiKey = (req) =>
  req.headers['x-gemini-key'] || process.env.GEMINI_API_KEY || '';
