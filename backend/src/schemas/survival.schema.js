export const SURVIVAL_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    completionProbability: { type: "INTEGER", description: "Percentage probability of completing critical tasks before the deadline (0-100)." },
    remainingWorkMinutes: { type: "INTEGER", description: "Total minutes of high focus work remaining." },
    recommendedActions: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    mindfulSurvivalExplanation: { type: "STRING", description: "Calm, emergency coaching advice from Aegis." }
  },
  required: ["completionProbability", "remainingWorkMinutes", "recommendedActions", "mindfulSurvivalExplanation"]
};
