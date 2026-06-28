export const PLANNER_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    schedule: {
      type: "ARRAY",
      description: "List of chronologically ordered focus blocks and breaks.",
      items: {
        type: "OBJECT",
        properties: {
          taskId: { type: "STRING" },
          title: { type: "STRING" },
          startTime: { type: "STRING" },
          endTime: { type: "STRING" },
          type: { type: "STRING", enum: ["task", "break"] },
          duration: { type: "INTEGER" }
        },
        required: ["title", "startTime", "endTime", "type", "duration"]
      }
    },
    mindfulSummary: { type: "STRING" }
  },
  required: ["schedule", "mindfulSummary"]
};

export const RESCHEDULE_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    missedTasks: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          taskId: { type: "STRING" },
          title: { type: "STRING" }
        },
        required: ["taskId", "title"]
      }
    },
    recommendations: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", enum: ["move", "delay", "preserve"] },
          taskId: { type: "STRING" },
          taskTitle: { type: "STRING" },
          suggestionText: { type: "STRING" },
          action: {
            type: "OBJECT",
            properties: {
              newDueDate: { type: "STRING" },
              newStartTime: { type: "STRING" }
            }
          }
        },
        required: ["type", "taskId", "taskTitle", "suggestionText", "action"]
      }
    },
    mindfulExplanation: { type: "STRING" }
  },
  required: ["missedTasks", "recommendations", "mindfulExplanation"]
};

export const RECOVERY_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    missedTask: { type: "STRING" },
    rescheduledTime: { type: "STRING" },
    adjustments: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    timelineUpdates: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          action: { type: "STRING" },
          taskId: { type: "STRING" },
          newStartTime: { type: "STRING" }
        },
        required: ["action", "taskId", "newStartTime"]
      }
    }
  },
  required: ["missedTask", "rescheduledTime", "adjustments", "timelineUpdates"]
};

export const ESTIMATION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    estimatedMinutes: { type: "INTEGER", description: "Estimated duration in minutes." },
    complexity: { type: "STRING", enum: ["Low", "Medium", "High", "Critical"] },
    cognitiveLoad: { type: "INTEGER", description: "Cognitive Load focus rating from 1 to 5." },
    confidence: { type: "INTEGER", description: "Percentage confidence in estimation from 0 to 100." }
  },
  required: ["estimatedMinutes", "complexity", "cognitiveLoad", "confidence"]
};

export const NEXT_RECOMMENDATION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    task: { type: "STRING", description: "Title of the recommended focus task." },
    reason: {
      type: "ARRAY",
      items: { type: "STRING" },
      description: "List of reasons for this recommendation."
    },
    estimatedDuration: { type: "INTEGER", description: "Estimated duration in minutes." }
  },
  required: ["task", "reason", "estimatedDuration"]
};
