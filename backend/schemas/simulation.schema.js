export const SIMULATION_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    scenarioA: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        completionProbability: { type: "INTEGER" },
        stressLevel: { type: "INTEGER" },
        goalSuccessRate: { type: "INTEGER" },
        narrativeInsight: { type: "STRING" }
      },
      required: ["title", "completionProbability", "stressLevel", "goalSuccessRate", "narrativeInsight"]
    },
    scenarioB: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        completionProbability: { type: "INTEGER" },
        stressLevel: { type: "INTEGER" },
        goalSuccessRate: { type: "INTEGER" },
        narrativeInsight: { type: "STRING" }
      },
      required: ["title", "completionProbability", "stressLevel", "goalSuccessRate", "narrativeInsight"]
    },
    scenarioC: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        completionProbability: { type: "INTEGER" },
        stressLevel: { type: "INTEGER" },
        goalSuccessRate: { type: "INTEGER" },
        narrativeInsight: { type: "STRING" }
      },
      required: ["title", "completionProbability", "stressLevel", "goalSuccessRate", "narrativeInsight"]
    },
    scenarioD: {
      type: "OBJECT",
      properties: {
        title: { type: "STRING" },
        completionProbability: { type: "INTEGER" },
        stressLevel: { type: "INTEGER" },
        goalSuccessRate: { type: "INTEGER" },
        narrativeInsight: { type: "STRING" }
      },
      required: ["title", "completionProbability", "stressLevel", "goalSuccessRate", "narrativeInsight"]
    },
    mindfulCoachAdvice: { type: "STRING" }
  },
  required: ["scenarioA", "scenarioB", "scenarioC", "scenarioD", "mindfulCoachAdvice"]
};
