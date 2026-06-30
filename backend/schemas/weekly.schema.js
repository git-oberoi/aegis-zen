export const WEEKLY_OPTIMIZER_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    weeklyPlanSummary: { type: "STRING" },
    riskAssessment: { type: "STRING" },
    priorityChanges: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    focusList: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    postponeList: {
      type: "ARRAY",
      items: { type: "STRING" }
    },
    ignoreList: {
      type: "ARRAY",
      items: { type: "STRING" }
    }
  },
  required: ["weeklyPlanSummary", "riskAssessment", "priorityChanges", "focusList", "postponeList", "ignoreList"]
};
