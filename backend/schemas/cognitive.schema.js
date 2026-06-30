export const COGNITIVE_LOAD_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    cognitiveLoad: { type: "INTEGER", description: "Cognitive Load rating from 0 to 100." },
    level: { type: "STRING", enum: ["Low", "Moderate", "High", "Critical"] },
    explanation: { type: "STRING", description: "Detailed explanation." },
    recommendations: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["cognitiveLoad", "level", "explanation", "recommendations"]
};
