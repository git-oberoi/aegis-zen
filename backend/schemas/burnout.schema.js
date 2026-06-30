export const BURNOUT_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    burnoutScore: { type: "INTEGER", description: "Burnout Score from 0 to 100." },
    category: { type: "STRING", enum: ["Healthy", "Moderate", "High", "Critical"] },
    metricsSummary: {
      type: "OBJECT",
      properties: {
        workloadChange: { type: "STRING" },
        cognitiveStress: { type: "STRING" },
        completionRatio: { type: "STRING" }
      },
      required: ["workloadChange", "cognitiveStress", "completionRatio"]
    },
    recommendations: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    trendData: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          day: { type: "STRING" },
          score: { type: "INTEGER" }
        },
        required: ["day", "score"]
      }
    },
    mindfulExplanation: { type: "STRING" }
  },
  required: ["burnoutScore", "category", "metricsSummary", "recommendations", "trendData", "mindfulExplanation"]
};
