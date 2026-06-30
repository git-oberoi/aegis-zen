export const calculateHeuristicSimulation = (tasks, habits) => {
  const completed = tasks.filter(t => t.status === 'completed').length;
  const total = tasks.length;
  const rawRatio = total > 0 ? (completed / total) : 0.65;
  const baselinePercentage = Math.round(rawRatio * 100);

  const avgStreak = habits.length > 0 
    ? habits.reduce((acc, h) => acc + (h.streak || 0), 0) / habits.length
    : 5;

  const baselineStress = Math.max(20, Math.min(85, 90 - baselinePercentage - avgStreak * 2));

  return {
    scenarioA: {
      title: "Scenario A: Aegis Recommended Workflow",
      completionProbability: 86,
      stressLevel: 22,
      goalSuccessRate: 89,
      narrativeInsight: "Aegis advises dynamic rescheduling, targeted focus blocks, and box breathing sequences. Stress levels decrease drastically, timeline goal achievements climb, and focus completes ahead of exhaustion boundaries."
    },
    scenarioB: {
      title: "Scenario B: Maintain Current Pace",
      completionProbability: Math.round(baselinePercentage),
      stressLevel: Math.round(baselineStress),
      goalSuccessRate: Math.max(15, Math.min(95, Math.round(baselinePercentage - 5))),
      narrativeInsight: "Continuing at your current pace is stable. You will complete key responsibilities, but trailing tasks will slowly overflow into evenings, keeping stress at a moderate plateau."
    },
    scenarioC: {
      title: "Scenario C: Increase Intentional Focus by 20%",
      completionProbability: Math.min(99, Math.round(baselinePercentage * 1.2)),
      stressLevel: Math.max(10, Math.round(baselineStress * 0.75)),
      goalSuccessRate: Math.min(99, Math.round(baselinePercentage * 1.25)),
      narrativeInsight: "By raising concentration efforts slightly (e.g., locking notifications, adding 15m of daily planning), workloads clear ahead of deadlines. Your stress index drops, and goal success climbs."
    },
    scenarioD: {
      title: "Scenario D: Allow Deadlines to Slip",
      completionProbability: Math.max(10, Math.round(baselinePercentage * 0.45)),
      stressLevel: Math.min(99, Math.round(baselineStress * 1.45)),
      goalSuccessRate: Math.max(5, Math.round(baselinePercentage * 0.3)),
      narrativeInsight: "Neglecting planned time boxes causes focus logs to cascade. Missed items escalate cognitive debt, forcing late-night survival sessions. Stress levels spike to critical alerts."
    },
    mindfulCoachAdvice: "Aegis highly advises stepping into Scenario A (Aegis Recommended Workflow). It optimizes your cognitive energy budget, locking completion probabilities at 86% while dropping stress levels to 22%."
  };
};
