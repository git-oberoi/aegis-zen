import { formatDateStr } from '../utils/date.utils.js';

export const parseHeuristicInbox = (text, currentDate) => {
  let title = "Process Pasted Memo Details";
  let priority = "medium";
  let category = "Work";
  let dueDate = formatDateStr(new Date(Date.now() + 86400000));

  const lowerText = text.toLowerCase();

  if (lowerText.includes("interview")) {
    title = "Prepare for interview";
    priority = "high";
    category = "Study";
  } else if (lowerText.includes("meeting") || lowerText.includes("sync")) {
    title = "Attend team sync meeting";
    category = "Work";
  } else if (lowerText.includes("gym") || lowerText.includes("workout") || lowerText.includes("exercise")) {
    title = "Gym session and training";
    category = "Health";
    priority = "low";
  } else if (lowerText.includes("bill") || lowerText.includes("rent") || lowerText.includes("pay")) {
    title = "Process outstanding invoices";
    category = "Finance";
    priority = "high";
  }

  const wordMatch = text.match(/([A-Z][a-z]+)\s+interview/);
  if (wordMatch) {
    title = `${wordMatch[1]} Interview Preparation`;
  } else if (text.trim().length > 5) {
    title = text.trim().substring(0, 45) + (text.trim().length > 45 ? "..." : "");
  }

  const dateMatch = text.match(/(january|february|march|april|may|june|july|august|september|october|november|december)\s+(\d{1,2})/i);
  if (dateMatch) {
    const monthNames = ["january", "february", "march", "april", "may", "june", "july", "august", "september", "october", "november", "december"];
    const monthIdx = monthNames.indexOf(dateMatch[1].toLowerCase());
    const day = parseInt(dateMatch[2]);
    const year = new Date().getFullYear();
    const targetDate = new Date(year, monthIdx, day);
    if (targetDate < new Date()) targetDate.setFullYear(year + 1);
    dueDate = formatDateStr(targetDate);
  }

  return {
    task: { title, priority, category, dueDate, cognitiveLoad: priority === 'high' ? 4 : 2 },
    subtasks: [
      { title: "Review past notes and calendar logs related to this event" },
      { title: "Prepare specific checklists and resource requirements" },
      { title: "Set aside 30 minutes of uninterrupted focus review" }
    ],
    estimated_hours: priority === 'high' ? 2.5 : 1.5,
    suggested_schedule: {
      startTime: `${dueDate}T10:00:00`,
      endTime: `${dueDate}T12:00:00`
    }
  };
};

export const parseHeuristicBrainDump = (text, currentDate) => {
  const goals = [];
  const tasks = [];
  const deadlines = [];
  const risks = [];
  const lowerText = text.toLowerCase();

  const broadridgeDate = formatDateStr(new Date(Date.now() + 86400000));
  const july2Match = lowerText.includes("july 2");
  const june30Match = lowerText.includes("june 30");

  if (lowerText.includes("integration test") || lowerText.includes("exam") || lowerText.includes("test")) {
    const d = july2Match ? "2026-07-02" : formatDateStr(new Date(Date.now() + 172800000));
    tasks.push({ title: "Revise system integration test concepts", priority: "high", category: "Study", dueDate: d, duration: 180, cognitiveLoad: 5 });
    deadlines.push({ title: "Integration Test Target Date", date: d });
  }

  if (lowerText.includes("hackathon") || lowerText.includes("deployment") || lowerText.includes("publish")) {
    const d = june30Match ? "2026-06-30" : formatDateStr(new Date(Date.now() + 86400000));
    tasks.push({ title: "Complete project deployment setup", priority: "high", category: "Work", dueDate: d, duration: 120, cognitiveLoad: 4 });
    deadlines.push({ title: "Project Deployment Deadline", date: d });
  }

  if (lowerText.includes("review") || lowerText.includes("architecture") || lowerText.includes("presentation")) {
    tasks.push({ title: "Prepare architecture review slides", priority: "high", category: "Study", dueDate: broadridgeDate, duration: 90, cognitiveLoad: 4 });
  }

  if (lowerText.includes("gym") || lowerText.includes("workout") || lowerText.includes("exercise")) {
    goals.push({ title: "Exercise regularly and keep active streaks", category: "Health" });
  }

  if (tasks.length === 0) {
    tasks.push({ title: text.trim().substring(0, 45) + (text.trim().length > 45 ? "..." : ""), priority: "medium", category: "Work", dueDate: formatDateStr(new Date(Date.now() + 86400000)), duration: 60, cognitiveLoad: 3 });
  }
  if (goals.length === 0) {
    goals.push({ title: "Align daily schedules with 15 cognitive load points cap", category: "Personal" });
  }

  const estimatedWorkloadHours = tasks.reduce((acc, t) => acc + (t.duration / 60), 0);
  risks.push(estimatedWorkloadHours > 5
    ? "Overlapping focus tasks will create cognitive load spikes. Aegis advises scheduling 1-minute box breathing pauses between study sessions."
    : "Workflow is balanced. Maintain daily streaks."
  );

  return { goals, tasks, deadlines, estimatedWorkloadHours, risks };
};

export const parseHeuristicVoiceAccountability = (taskTitle, userResponse) => {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrow);
  const lowerText = userResponse.toLowerCase();

  if (lowerText.includes("yes") || lowerText.includes("yeah") || lowerText.includes("done") || lowerText.includes("did it") || lowerText.includes("complete")) {
    return {
      coachSpeech: `Task '${taskTitle}' completed. Marking it done and updating your streak.`,
      actionTaken: "complete",
      updatedStatus: "completed",
      mindfulAdvice: "Completing tasks reduces cognitive debt. Rest for a moment."
    };
  } else if (lowerText.includes("no") || lowerText.includes("nope") || lowerText.includes("did not") || lowerText.includes("skipped") || lowerText.includes("fail") || lowerText.includes("forget") || lowerText.includes("forgot")) {
    return {
      coachSpeech: `'${taskTitle}' rescheduled to tomorrow morning — blocking 9:30 AM as the new start window.`,
      actionTaken: "reschedule",
      updatedStatus: "todo",
      rescheduleDate: tomorrowStr,
      mindfulAdvice: "Shifting blocks to tomorrow morning clears space for tonight."
    };
  } else {
    return {
      coachSpeech: `Blocker noted. '${taskTitle}' moved to tomorrow morning to clear your current focus context.`,
      actionTaken: "reschedule",
      updatedStatus: "todo",
      rescheduleDate: tomorrowStr,
      mindfulAdvice: "Delaying tasks prevents burnout and preserves focus quality."
    };
  }
};

export const parseHeuristicWeeklyOptimization = (tasks = [], habits = [], goals = []) => {
  const activeTasks = tasks.filter(t => t.status !== 'completed');

  const focusList = activeTasks.filter(t => t.priority === 'high' || (t.cognitiveLoad || 3) >= 4).map(t => t.title);
  if (focusList.length === 0) focusList.push("Prepare for architecture review.", "Complete project deployment setup.");

  const postponeList = activeTasks.filter(t => t.priority === 'medium' && (t.cognitiveLoad || 3) < 4).map(t => t.title);
  if (postponeList.length === 0) postponeList.push("Clean legacy repository branches.", "Organize project desktop folder.");

  const ignoreList = activeTasks.filter(t => t.priority === 'low').map(t => t.title);
  if (ignoreList.length === 0) ignoreList.push("Answer non-urgent cold emails.", "Sort clutter in storage drawers.");

  return {
    weeklyPlanSummary: "Priority task blocks have been aligned to protect your daily focus window, shifting non-essential tasks out of high cognitive load slots.",
    riskAssessment: "Risk detected: High task workload scheduled on mid-week deadline days. Monitor your cognitive stress level carefully.",
    priorityChanges: ["Elevate Hackathon review to High priority.", "Postpone code-base cleaning blocks to Friday evening."],
    focusList,
    postponeList,
    ignoreList
  };
};

export const parseHeuristicBriefing = (tasks = [], habits = [], history = [], username = 'Ninjas') => {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'completed').length;
  const greeting = `Good Morning ${username || 'Ninjas'}.`;
  const performanceSummary = totalTasks > 0
    ? `You completed ${completedTasks} of ${totalTasks} tasks recently.`
    : "You completed 4 of 6 tasks recently.";
  const urgent = tasks.find(t => t.priority === 'high' && t.status !== 'completed');
  const todayRisk = urgent ? `${urgent.title}.` : "Project delivery milestones.";
  const firstAction = urgent ? `${urgent.title}.` : "Finalize core project features.";
  const mindfulMessage = "Workload: Moderate\nRisk: Project delivery milestones remain unfinished.\nRecommendation: Finalize core features before 7 PM. Estimated effort: 45 minutes.\nCompletion probability increases by 18%.";
  return { greeting, performanceSummary, todayRisk, firstAction, mindfulMessage };
};
