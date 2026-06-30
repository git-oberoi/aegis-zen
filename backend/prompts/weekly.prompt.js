import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildWeeklyOptimizerPrompt = (tasks, habits, goals) => `
${AEGIS_SYSTEM_PROMPT}
Optimize the user's workload for the week.
Analyze:
- Tasks list: ${JSON.stringify(tasks)}
- Habits details: ${JSON.stringify(habits)}
- Active goals: ${JSON.stringify(goals)}

Deliver:
1. A weekly plan summary (weeklyPlanSummary).
2. Risk assessment for deadlines/stress (riskAssessment).
3. 2 priority adjustments (priorityChanges).
4. List of tasks to focus on (focusList).
5. List of tasks to postpone (postponeList).
6. List of tasks to ignore/archive (ignoreList).
Return conformed JSON.
`;
