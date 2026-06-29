import { formatDateStr } from '../utils/date.utils.js';

export const generateHeuristicSchedule = (tasks, selectedDate, survivalMode = false) => {
  let startHour = 9;
  let startMin = 0;
  const schedule = [];
  
  const sorted = [...tasks].sort((a, b) => {
    if (a.priority === 'high' && b.priority !== 'high') return -1;
    if (a.priority !== 'high' && b.priority === 'high') return 1;
    return (b.cognitiveLoad || 3) - (a.cognitiveLoad || 3);
  });

  sorted.forEach((task) => {
    const startStr = `${selectedDate}T${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`;
    const duration = survivalMode ? Math.round((task.duration || 30) * 1.1) : (task.duration || 30);
    
    let endHour = startHour;
    let endMin = startMin + duration;
    if (endMin >= 60) {
      endHour += Math.floor(endMin / 60);
      endMin = endMin % 60;
    }
    const endStr = `${selectedDate}T${endHour.toString().padStart(2, '0')}:${endMin.toString().padStart(2, '0')}:00`;

    schedule.push({
      taskId: task.id,
      title: task.title,
      startTime: startStr,
      endTime: endStr,
      type: "task",
      duration: duration
    });

    startHour = endHour;
    startMin = endMin;
    
    const breakDuration = survivalMode ? 5 : ((task.cognitiveLoad || 3) >= 4 ? 15 : 10);
    let breakEndHour = startHour;
    let breakEndMin = startMin + breakDuration;
    if (breakEndMin >= 60) {
      breakEndHour += Math.floor(breakEndMin / 60);
      breakEndMin = breakEndMin % 60;
    }
    
    const breakStartStr = `${selectedDate}T${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`;
    const breakEndStr = `${selectedDate}T${breakEndHour.toString().padStart(2, '0')}:${breakEndMin.toString().padStart(2, '0')}:00`;

    schedule.push({
      taskId: "",
      title: survivalMode ? "Urgent Breathing Break" : "Rest & Breathing Break",
      startTime: breakStartStr,
      endTime: breakEndStr,
      type: "break",
      duration: breakDuration
    });

    startHour = breakEndHour;
    startMin = breakEndMin;
  });

  return {
    schedule,
    mindfulSummary: survivalMode 
      ? "Survival mode schedule activated. Breaks are compressed to 5 minutes to maximize focus output. Focus on high priority items first."
      : "Aegis has harmonized your flow schedule using our local algorithm. Deep focus tasks are distributed with breathing breaks placed in between."
  };
};

export const generateHeuristicReschedule = (tasks, events, selectedDate, currentTime) => {
  const current = new Date(currentTime);
  const missedTasks = [];
  const recommendations = [];

  events.forEach(event => {
    if (event.startTime.startsWith(selectedDate)) {
      const start = new Date(event.startTime);
      const end = new Date(start.getTime() + (event.duration || 30) * 60 * 1000);
      
      if (end < current) {
        const task = tasks.find(t => t.id === event.taskId);
        if (task && task.status !== 'completed') {
          missedTasks.push({
            taskId: task.id,
            title: task.title
          });

          const isLate = current.getHours() >= 18;
          if (isLate) {
            const tomorrow = new Date(current);
            tomorrow.setDate(tomorrow.getDate() + 1);
            const tomorrowStr = formatDateStr(tomorrow);
            
            recommendations.push({
              type: "move",
              taskId: task.id,
              taskTitle: task.title,
              suggestionText: `Move '${task.title}' to tomorrow morning, as the day is winding down.`,
              action: {
                newDueDate: tomorrowStr,
                newStartTime: `${tomorrowStr}T09:30:00`
              }
            });
          } else {
            const newStart = new Date(current.getTime() + 15 * 60 * 1000);
            const offset = newStart.getTimezoneOffset();
            const localDate = new Date(newStart.getTime() - (offset * 60 * 1000));
            const newStartStr = localDate.toISOString().split('.')[0];
            
            recommendations.push({
              type: "delay",
              taskId: task.id,
              taskTitle: task.title,
              suggestionText: `Delay '${task.title}' to start at ${newStart.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}.`,
              action: {
                newStartTime: newStartStr
              }
            });
          }
        }
      }
    }
  });

  return {
    missedTasks,
    recommendations,
    mindfulExplanation: "I detected overdue focus blocks. I recommend drifting them to open slots or moving them to tomorrow morning so you can rest tonight."
  };
};

export const parseHeuristicRecovery = (tasks = [], events = [], missedTaskName) => {
  const missedTitle = missedTaskName || "Architecture Review";
  const match = tasks.find(t => t.title.toLowerCase() === missedTitle.toLowerCase()) || tasks[0];
  const missedTaskId = match ? match.id : "missed_task_id";

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  const tomorrowStr = formatDateStr(tomorrow);

  const adjustMatch = tasks.find(t => t.title.toLowerCase().includes("reading") || t.title.toLowerCase().includes("review") || t.id !== missedTaskId);
  const adjustTaskId = adjustMatch ? adjustMatch.id : "adjust_task_id";
  const adjustTitle = adjustMatch ? adjustMatch.title : "Reading Session";

  return {
    missedTask: missedTitle,
    rescheduledTime: "Tomorrow 7 PM",
    adjustments: [
      "Tomorrow 7 PM.",
      `Move ${adjustTitle}.`,
      "Preserve project deployment prep."
    ],
    timelineUpdates: [
      {
        action: "reschedule",
        taskId: missedTaskId,
        newStartTime: `${tomorrowStr}T19:00:00`
      },
      {
        action: "move",
        taskId: adjustTaskId,
        newStartTime: `${tomorrowStr}T20:00:00`
      }
    ]
  };
};

export const parseHeuristicEstimate = (title, description = "") => {
  const combined = (title + " " + description).toLowerCase();

  let estimatedMinutes = 45;
  let complexity = "Low";
  let cognitiveLoad = 2;

  if (combined.includes("deploy") || combined.includes("deployment") || combined.includes("production") || combined.includes("infrastructure")) {
    estimatedMinutes = 60;
    complexity = "High";
    cognitiveLoad = 4;
  } else if (combined.includes("exam") || combined.includes("test") || combined.includes("certification") || combined.includes("study") || combined.includes("learn")) {
    estimatedMinutes = 120;
    complexity = "Medium";
    cognitiveLoad = 4;
  } else if (combined.includes("review") || combined.includes("architecture") || combined.includes("presentation")) {
    estimatedMinutes = 90;
    complexity = "Medium";
    cognitiveLoad = 3;
  } else if (combined.includes("gym") || combined.includes("workout") || combined.includes("exercise") || combined.includes("breathing")) {
    estimatedMinutes = 45;
    complexity = "Low";
    cognitiveLoad = 1;
  }

  return {
    estimatedMinutes,
    complexity,
    cognitiveLoad,
    confidence: 75
  };
};

export const parseHeuristicRecommendNext = (tasks = [], energyLevel = 3) => {
  const pending = tasks.filter(t => t.status !== 'completed');

  if (pending.length === 0) {
    return {
      task: "Practice 1-Minute Box Breathing",
      reason: [
        "All pending tasks are completed",
        "Restore cognitive balance",
        "Clear mental pathways for tomorrow"
      ],
      estimatedDuration: 15
    };
  }

  const scored = pending.map(t => {
    let score = 0;
    if (t.priority === 'high') score += 100;
    else if (t.priority === 'medium') score += 50;
    else score += 10;

    const taskLoad = t.cognitiveLoad || 3;
    const loadDiff = Math.abs(taskLoad - energyLevel);
    score += (5 - loadDiff) * 15;

    return { task: t, score };
  });

  scored.sort((a, b) => b.score - a.score);
  const bestTask = scored[0].task;

  const reasons = [
    bestTask.priority === 'high' ? "Highest pending urgency priority" : "Good task to progress flow balance",
    `Perfect load match for your ⚡ ${energyLevel}/5 current energy`,
    "Estimated duration fits nicely in a standard focus sprint block"
  ];

  return {
    task: bestTask.title,
    reason: reasons,
    estimatedDuration: bestTask.duration || 45
  };
};
