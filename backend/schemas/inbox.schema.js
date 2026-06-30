export const INBOX_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    task: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING", description: "A summary action title of the main task." },
        priority: { type: "STRING", enum: ["high", "medium", "low"] },
        category: { type: "STRING", enum: ["Work", "Study", "Personal", "Health", "Finance"] },
        dueDate: { type: "STRING", description: "YYYY-MM-DD format for target deadline." },
        cognitiveLoad: { type: "INTEGER", description: "Cognitive Load rating from 1 to 5." }
      },
      required: ["title", "priority", "category", "dueDate", "cognitiveLoad"]
    },
    subtasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Clear subtask milestone action step." }
        },
        required: ["title"]
      }
    },
    estimated_hours: { type: "NUMBER", description: "Estimated focus hours to complete this task (e.g., 2.5)." },
    suggested_schedule: {
      type: "OBJECT",
      properties: {
        startTime: { type: "STRING", description: "Suggested start time ISO local format (optional)." },
        endTime: { type: "STRING", description: "Suggested end time ISO local format (optional)." }
      }
    }
  },
  required: ["task", "subtasks", "estimated_hours"]
};

export const BRAINDUMP_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    goals: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Title of the goal." },
          category: { type: "STRING", enum: ["Work", "Study", "Personal", "Health", "Finance"] }
        },
        required: ["title", "category"]
      }
    },
    tasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Title of the focus task." },
          priority: { type: "STRING", enum: ["high", "medium", "low"] },
          category: { type: "STRING", enum: ["Work", "Study", "Personal", "Health", "Finance"] },
          dueDate: { type: "STRING", description: "YYYY-MM-DD format." },
          duration: { type: "INTEGER", description: "Estimated duration in minutes." },
          cognitiveLoad: { type: "INTEGER", description: "Cognitive Load rating from 1 to 5." }
        },
        required: ["title", "priority", "category", "dueDate", "duration", "cognitiveLoad"]
      }
    },
    deadlines: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          title: { type: "STRING", description: "Title of the deadline target." },
          date: { type: "STRING", description: "YYYY-MM-DD format." }
        },
        required: ["title", "date"]
      }
    },
    estimatedWorkloadHours: { type: "NUMBER", description: "Total estimated workload hours." },
    risks: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["goals", "tasks", "deadlines", "estimatedWorkloadHours", "risks"]
};

export const VOICE_ACCOUNTABILITY_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    coachSpeech: { type: "STRING", description: "What Aegis will say out loud to the user." },
    actionTaken: { type: "STRING", enum: ["reschedule", "complete", "none"] },
    updatedStatus: { type: "STRING", enum: ["todo", "in_progress", "completed", "none"] },
    rescheduleDate: { type: "STRING", description: "YYYY-MM-DD format for target deadline (optional)." },
    mindfulAdvice: { type: "STRING", description: "Zen suggestions or support words explaining why this action keeps focus balanced." }
  },
  required: ["coachSpeech", "actionTaken", "updatedStatus", "mindfulAdvice"]
};
