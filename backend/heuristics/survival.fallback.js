export const calculateHeuristicSurvival = (tasks) => {
  const criticalTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
  const remainingWorkMinutes = criticalTasks.reduce((acc, t) => acc + (t.duration || 30), 0);
  const hoursLeft = 24;
  
  let completionProbability = 100;
  if (remainingWorkMinutes > 0) {
    const stressRatio = remainingWorkMinutes / (hoursLeft * 60);
    completionProbability = Math.max(15, Math.min(98, Math.round(100 - stressRatio * 90)));
  }

  const recommendedActions = [
    "Hide low-value and easy flow tasks from your workspace to clear mental noise.",
    "Pause habit checks: Aegis has locked habits to avoid splitting your focus.",
    "Compress rest timers: Shift your focus block breaks to 5-minute segments.",
    "Practice standard box breathing to suppress rising deadline panic."
  ];

  return {
    completionProbability,
    remainingWorkMinutes,
    recommendedActions,
    mindfulSurvivalExplanation: `Emergency Survival Mode Active. Aegis has filtered your display to isolate ${criticalTasks.length} critical deadline task(s). Keep focus narrow. Low-value habits are paused.`
  };
};
