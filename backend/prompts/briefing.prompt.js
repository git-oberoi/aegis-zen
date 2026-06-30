import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildBriefingPrompt = (tasks, habits, history, username = 'Ninjas') => `
${AEGIS_SYSTEM_PROMPT}
Generate a personalized morning briefing for the user named ${username}.
Analyze their historical stats:
- Tasks database: ${JSON.stringify(tasks)}
- Habits status: ${JSON.stringify(habits)}
- Schedule logs: ${JSON.stringify(history)}

Instructions:
1. Greet them warmly as ${username} (e.g. "Good Morning ${username}.").
2. Summarize their task completion efficiency from yesterday (or recent days if yesterday is blank).
3. Identify today's biggest calendar/cognitive load danger (todayRisk).
4. Recommend the single best first task to start today.
5. In "mindfulMessage", construct a practical, multi-line Aegis Assessment. Do NOT provide generic motivational advice. Format it exactly as follows:
Workload: [Low/Moderate/High]
Risk: [Brief statement of specific danger/overdue items]
Recommendation: [Specific task recommendation with optimal completion time and estimated effort, e.g. "Complete deployment setup before 7 PM. Estimated effort: 45 minutes."]
Completion probability increases by [predicted percentage rise, e.g. "18%"].
6. Return conformed JSON matching the schema BRIEFING_RESPONSE_SCHEMA.
`;
