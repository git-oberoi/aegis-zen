import { AEGIS_SYSTEM_PROMPT } from './aegis.prompt.js';

export const buildInboxPrompt = (text, currentDate) => `
${AEGIS_SYSTEM_PROMPT}
Your task is to parse the following unstructured text (which could be an email, message, note, or announcement) and extract a highly structured focus task, create action-oriented subtasks, estimate the hours needed to complete, and suggest a start/end time.

User Pasted Text:
"${text}"

Current Reference Date is: ${currentDate}

Instructions:
1. Extract title, priority level (high, medium, low), category (Work, Study, Personal, Health, Finance), and due date (format YYYY-MM-DD). If no clear date is mentioned, assume tomorrow.
2. Build 3 to 4 granular, action-oriented subtasks that make preparation concrete.
3. Estimate total focus hours needed (estimated_hours).
4. Suggest a start/end time local ISO block on the task's due date.
5. Return the structured JSON conforming to the response schema.
`;

export const buildBrainDumpPrompt = (text, currentDate) => `
${AEGIS_SYSTEM_PROMPT}
Analyze this user's unstructured brain dump (which could contain overlapping goals, tasks, deadlines, and responsibilities):
"${text}"

Current Date Reference: ${currentDate}

Instructions:
1. Extract goals, focus tasks (due date, priority, cognitive load, duration), and deadline dates.
2. Estimate total workload hours (estimatedWorkloadHours).
3. Identify calendar or mental overload risks.
4. Return conformed JSON.
`;

export const buildVoiceAccountabilityPrompt = (taskTitle, userResponse) => `
${AEGIS_SYSTEM_PROMPT}
The user scheduled a task titled "${taskTitle}" for today.
In our check-in, they gave this response about their progress: "${userResponse}"

Decide whether:
1. They succeeded (actionTaken = "complete", updatedStatus = "completed").
2. They did not complete it, and need it rescheduled to tomorrow (actionTaken = "reschedule", updatedStatus = "todo").
3. They gave a reason/blocker (e.g. "I got blocked by bugs", "I was too tired"). Recommend moving it to tomorrow and advise them.

Return conformed JSON.
`;
