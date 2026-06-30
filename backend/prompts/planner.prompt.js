import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildPlannerPrompt = (selectedDate, survivalModeActive) => `
${AEGIS_SYSTEM_PROMPT}
Analyze the following user tasks list and organize them into an optimized daily schedule for the date: ${selectedDate}.
Survival Mode is ${survivalModeActive ? 'ACTIVE' : 'OFF'}.
`;

export const buildReschedulePrompt = (currentTime, selectedDate) => `
${AEGIS_SYSTEM_PROMPT}
Analyze overdue calendar tasks relative to ${currentTime} on date ${selectedDate} and recommend rescheduling.
`;

export const buildRecoveryPrompt = (missedTask, tasks, events) => `
${AEGIS_SYSTEM_PROMPT}
Find a recovery slot for the missed/overdue task "${missedTask}".
Analyze:
- Tasks list: ${JSON.stringify(tasks)}
- Current timeline events: ${JSON.stringify(events)}

Propose a recovery schedule, list other events to move (e.g., Reading Session) and select events to preserve (e.g., Interview preparation).
Format the rescheduled times and adjustments. Return conformed JSON.
`;

export const buildEstimatePrompt = (title, description) => `
${AEGIS_SYSTEM_PROMPT}
Your task is to accurately estimate:
1. Expected duration in minutes (estimatedMinutes) to complete the task.
2. Cognitive complexity level (complexity: Low, Medium, High, Critical).
3. Focus requirement / Cognitive Load score (cognitiveLoad: 1 to 5).
4. Percentage confidence score (confidence: 0 to 100) of this prediction.

Task Title: "${title}"
Task Description: "${description || ''}"

Return conformed structured JSON.
`;

export const buildRecommendNextPrompt = (energyLevel, tasks) => `
${AEGIS_SYSTEM_PROMPT}
Rank all pending tasks and recommend exactly one next task based on the user's focus energy:

User Current Energy Level: ⚡ ${energyLevel}/5
Pending Tasks List:
${JSON.stringify(tasks.filter(t => t.status !== 'completed'))}

Instructions:
1. Select the single best task matching the priority level and energy constraints.
2. Build 3 clear, crisp bullet point reasons for this task.
3. Return conformed JSON.
`;
