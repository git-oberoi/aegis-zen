import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildSurvivalPrompt = () => `
${AEGIS_SYSTEM_PROMPT}
Calculate emergency schedule statistics under Deadline Survival Mode.
`;
