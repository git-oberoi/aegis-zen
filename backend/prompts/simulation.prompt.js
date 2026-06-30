import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildSimulationPrompt = () => `
${AEGIS_SYSTEM_PROMPT}
Perform a Future Self Simulation based on the user's workload, habits, and streaks.
Generate exactly four scenarios according to the schema:
- scenarioA: Aegis Recommended Workflow (Optimized: completion probability above 80%, stress level below 30%, goal success above 80%)
- scenarioB: Maintain Current Pace / Workflow
- scenarioC: Increase Intentional Focus by 20%
- scenarioD: Allow Deadlines to Slip
`;
