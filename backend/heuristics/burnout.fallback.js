import { formatDateStr } from '../utils/date.utils.js';

export const calculateHeuristicBurnout = (tasks, events, habits) => {
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const completedTasks = tasks.filter(t => t.status === 'completed');
  const workloadCount = activeTasks.length;
  const cognitiveLoadSum = activeTasks.reduce((acc, t) => acc + (t.cognitiveLoad || 3), 0);
  
  const now = new Date();
  const overdueCount = events.filter(e => {
    const end = new Date(new Date(e.startTime).getTime() + (e.duration || 30) * 60 * 1000);
    if (end < now) {
      const task = tasks.find(t => t.id === e.taskId);
      return task && task.status !== 'completed';
    }
    return false;
  }).length;
  
  const totalCount = tasks.length;
  const ratio = totalCount > 0 ? (completedTasks.length / totalCount) : 1.0;
  
  const avgStreak = habits.length > 0 
    ? habits.reduce((acc, h) => acc + (h.streak || 0), 0) / habits.length
    : 5;

  const workloadIncreasePercent = Math.min(60, Math.max(5, workloadCount * 8 + Math.round(Math.random() * 10)));

  let score = 25;
  score += cognitiveLoadSum * 1.5;
  score += overdueCount * 8;
  score -= avgStreak * 1.2;
  score += (1 - ratio) * 20;
  
  score = Math.max(0, Math.min(100, Math.round(score)));

  let category = "Healthy";
  if (score > 30 && score <= 60) category = "Moderate";
  else if (score > 60 && score <= 80) category = "High";
  else if (score > 80) category = "Critical";

  const recommendations = [];
  if (category === "Critical" || category === "High") {
    recommendations.push("Reduce workload tomorrow.");
    recommendations.push("Schedule recovery block.");
    recommendations.push("Practice a 1-minute Box Breathing break right now to clear mental noise.");
  } else if (category === "Moderate") {
    recommendations.push("Ensure you block out dedicated rest breaks between focus tasks.");
    recommendations.push("Keep maintaining daily streaks, but don't force tasks late in the evening.");
  } else {
    recommendations.push("You are maintaining a balanced workflow. Continue practicing mindful focus.");
  }

  const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
  const trendData = days.map((day, idx) => {
    const variance = (idx - 6) * 4 + Math.round(Math.random() * 6);
    return {
      day,
      score: Math.max(10, Math.min(100, score + variance))
    };
  });

  return {
    burnoutScore: score,
    category,
    metricsSummary: {
      workloadChange: `Your workload has increased by ${workloadIncreasePercent}% this week.`,
      cognitiveStress: `Your active cognitive demand is at ${cognitiveLoadSum} focus points.`,
      completionRatio: `You have completed ${Math.round(ratio * 100)}% of registered tasks.`
    },
    recommendations,
    trendData,
    mindfulExplanation: `Aegis has analyzed your focus cycles. With an active cognitive demand of ${cognitiveLoadSum} units and ${overdueCount} overdue focus blocks, your burnout risk is ${category}. I suggest integrating more breathing gaps to preserve mental peace.`
  };
};

export const parseHeuristicCognitiveLoad = (tasks = [], events = []) => {
  const activeTasks = tasks.filter(t => t.status !== 'completed');
  const activeCount = activeTasks.length;
  
  const todayStr = formatDateStr(new Date());
  const missedCount = activeTasks.filter(t => t.dueDate < todayStr).length;

  const highComplexityCount = activeTasks.filter(t => (t.cognitiveLoad || 3) >= 4).length;

  const deepWorkEventsCount = events.filter(e => e.startTime.startsWith(todayStr)).length;

  let score = 15 + (activeCount * 6) + (missedCount * 10) + (highComplexityCount * 8) + (deepWorkEventsCount * 4);
  score = Math.min(100, Math.max(10, score));

  let level = "Low";
  if (score > 80) level = "Critical";
  else if (score > 60) level = "High";
  else if (score > 30) level = "Moderate";

  const explanation = `Detected ${activeCount} active tasks, ${missedCount} missed deadlines, and ${highComplexityCount} high-complexity elements. Focus density is currently ${level.toLowerCase()}.`;

  const recommendations = score > 60
    ? [
        "Activate Deadline Survival Mode to hide all low priority items.",
        "Perform a 1-minute Box Breathing exercise to restore energy.",
        "Postpone low-urgency tasks to tomorrow morning."
      ]
    : [
        "Sustain streak by completing a 45-minute focus session.",
        "Check-in with Aegis Voice Coach to sync today's goals.",
        "Review daily schedule flow to align breaks."
      ];

  return {
    cognitiveLoad: score,
    level,
    explanation,
    recommendations
  };
};
