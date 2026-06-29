export const BRIEFING_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    greeting: { type: "STRING", description: "Personalized greeting, e.g. 'Good Morning Demo User.'" },
    performanceSummary: { type: "STRING", description: "Performance summary, e.g. 'You completed 4 of 6 tasks yesterday.'" },
    todayRisk: { type: "STRING", description: "Primary schedule risk, e.g. 'Unfinished project goals.'" },
    firstAction: { type: "STRING", description: "Recommended first task action, e.g. 'Review critical milestones.'" },
    mindfulMessage: { type: "STRING", description: "Calming Zen message from Aegis." }
  },
  required: ["greeting", "performanceSummary", "todayRisk", "firstAction", "mindfulMessage"]
};
