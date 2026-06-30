import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildBurnoutPrompt = () => `
${AEGIS_SYSTEM_PROMPT}
Predict workload burnout score (0-100), categories, trend scores, and mindful interventions.
`;

export const buildCognitiveLoadPrompt = (tasks, events) => `
${AEGIS_SYSTEM_PROMPT}
Calculate the user's current Cognitive Load metric (0-100) and load level (Low, Moderate, High, Critical) based on these parameters:
- Active tasks: ${JSON.stringify(tasks.filter(t => t.status !== 'completed'))}
- Scheduled events: ${JSON.stringify(events)}

Evaluate upcoming deadlines, task counts, task complexity (cognitiveLoad rating), and deep work calendar focus blocks.
Formulate 3 concrete Zen actions to reduce workload stress.
Return conformed JSON.
`;
