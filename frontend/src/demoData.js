// Helper to format date to YYYY-MM-DD
const formatDateStr = (date) => {
  const d = new Date(date);
  let month = '' + (d.getMonth() + 1);
  let day = '' + d.getDate();
  const year = d.getFullYear();

  if (month.length < 2) month = '0' + month;
  if (day.length < 2) day = '0' + day;

  return [year, month, day].join('-');
};

export const DEMO_USERNAME = 'Ninjas';

export const DEMO_TASKS = [
  {
    id: 'task_demo_1',
    title: 'Finish Aegis Zen landing page redesign',
    priority: 'high',
    category: 'Work',
    dueDate: formatDateStr(new Date()),
    duration: 60,
    status: 'in_progress',
    cognitiveLoad: 4,
    subtasks: [
      { id: 'sub_demo_1_1', title: 'Verify responsive CSS grid layout', completed: true },
      { id: 'sub_demo_1_2', title: 'Integrate the Explore Demo mode state flow', completed: false }
    ]
  },
  {
    id: 'task_demo_2',
    title: 'Review AI task suggestions & balance cognitive load',
    priority: 'high',
    category: 'Study',
    dueDate: formatDateStr(new Date(Date.now() + 86400000)), // Tomorrow
    duration: 30,
    status: 'todo',
    cognitiveLoad: 3,
    subtasks: []
  },
  {
    id: 'task_demo_3',
    title: 'Practice ocean wave breathing break exercise',
    priority: 'low',
    category: 'Personal',
    dueDate: formatDateStr(new Date()),
    duration: 15,
    status: 'completed',
    cognitiveLoad: 1,
    subtasks: []
  },
  {
    id: 'task_demo_4',
    title: 'Plan tomorrow\'s focus schedule with Aegis smart planner',
    priority: 'medium',
    category: 'Work',
    dueDate: formatDateStr(new Date()),
    duration: 20,
    status: 'todo',
    cognitiveLoad: 2,
    subtasks: []
  }
];

export const DEMO_EVENTS = [
  {
    id: 'event_demo_1',
    taskId: 'task_demo_1',
    title: 'Aegis Zen Landing Page Redesign',
    startTime: `${formatDateStr(new Date())}T14:00:00`,
    duration: 60
  },
  {
    id: 'event_demo_2',
    taskId: 'task_demo_3',
    title: 'Practice Breathing Exercise',
    startTime: `${formatDateStr(new Date())}T10:30:00`,
    duration: 15
  }
];

export const DEMO_HABITS = [
  { id: 'h_demo_1', title: '1-min Breathing Break', streak: 8, history: [formatDateStr(new Date(Date.now() - 86400000))] },
  { id: 'h_demo_2', title: 'Plan Day in Morning', streak: 12, history: [formatDateStr(new Date()), formatDateStr(new Date(Date.now() - 86400000))] },
  { id: 'h_demo_3', title: 'Mindful Focus Block (45m)', streak: 5, history: [] }
];

export const DEMO_BRIEFING = {
  greeting: 'Good Morning Ninjas.',
  performanceSummary: 'You completed 3 of 4 tasks recently and maintained a balanced cognitive budget.',
  todayRisk: 'Landing page redesign has a high cognitive load (4) and is scheduled for today.',
  firstAction: 'Finish Aegis Zen landing page redesign.',
  mindfulMessage: 'Workload: Moderate\nRisk: High cognitive load tasks remain unfinished.\nRecommendation: Start with your landing page redesign task before 3 PM. Estimated effort: 60 minutes.\nCompletion probability increases by 24%.'
};

export const DEMO_RISK_ALERT = {
  riskType: 'high_cognitive_load',
  message: 'Warning: You are approaching your 15-unit cognitive threshold. Consider spacing out your heavy tasks.'
};

export const DEMO_RECOMMENDATION = {
  taskTitle: 'Finish Aegis Zen landing page redesign',
  reason: 'It matches your peak energy hours and has a looming deadline.'
};

export const DEMO_NOTIFICATIONS = [
  {
    id: 'notif_demo_1',
    title: 'Calm morning greeting',
    message: 'Welcome back. Take a deep breath before diving into your flow.',
    read: false,
    time: '5m ago'
  },
  {
    id: 'notif_demo_2',
    title: 'Daily budget balanced',
    message: 'Your current daily plan sits comfortably at 9/15 energy units.',
    read: true,
    time: '1h ago'
  }
];
