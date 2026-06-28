export const BRIEFING_RESPONSE_SCHEMA = {
  type: "OBJECT",
  properties: {
    greeting: { type: "STRING", description: "Personalized greeting, e.g. 'Good Morning Shivam.'" },
    performanceSummary: { type: "STRING", description: "Performance summary, e.g. 'You completed 4 of 6 tasks yesterday.'" },
    todayRisk: { type: "STRING", description: "Primary schedule risk, e.g. 'Hackathon deployment.'" },
    firstAction: { type: "STRING", description: "Recommended first task action, e.g. 'Complete deployment setup.'" },
    mindfulMessage: { type: "STRING", description: "Calming Zen message from Aegis." }
  },
  required: ["greeting", "performanceSummary", "todayRisk", "firstAction", "mindfulMessage"]
};
