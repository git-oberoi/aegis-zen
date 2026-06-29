import React, { useState, useEffect, useRef } from 'react';
import {
  Bot,
  Plus,
  Trash2,
  Calendar as CalendarIcon,
  Check,
  CheckSquare,
  Settings,
  Volume2,
  VolumeX,
  Mic,
  MicOff,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Clock,
  Sparkles,
  CheckCircle2,
  RotateCcw,
  Flame,
  Award,
  Wind,
  User,
  Bell,
  Play,
  ArrowLeft,
  Shield
} from 'lucide-react';
import { ProductivityAgent } from './gemini';
import { DEMO_USERNAME, DEMO_TASKS, DEMO_EVENTS, DEMO_HABITS, DEMO_BRIEFING, DEMO_NOTIFICATIONS } from './demoData';
import { INITIAL_USER_TASKS, INITIAL_USER_EVENTS, INITIAL_USER_HABITS, INITIAL_USER_USERNAME } from './userData';
import DailyBriefing from './components/DailyBriefing';
import CognitiveLoad from './components/CognitiveLoad';
import SmartRecovery from './components/SmartRecovery';
import WeeklyOptimizer from './components/WeeklyOptimizer';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || (import.meta.env.PROD ? '' : 'http://localhost:5000');

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

// Helper to format ISO time to AM/PM string
const formatTimeStr = (isoString) => {
  try {
    const d = new Date(isoString);
    let hours = d.getHours();
    const minutes = d.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12;
    return `${hours}:${minutes.toString().padStart(2, '0')} ${ampm}`;
  } catch (e) {
    return '';
  }
};

// Clean query parameters and reset localStorage if ?reset=true is provided
if (typeof window !== 'undefined') {
  const urlParams = new URLSearchParams(window.location.search);
  if (urlParams.get('reset') === 'true') {
    localStorage.clear();
    const url = new URL(window.location.href);
    url.searchParams.delete('reset');
    window.history.replaceState({}, '', url.pathname + url.search);
  }
}

function App() {
  // App states
  const [apiKey, setApiKey] = useState(() => localStorage.getItem('vibe_gemini_key') || '');
  const [isOnboarded, setIsOnboarded] = useState(() => localStorage.getItem('aegis_onboarded') === 'true');
  const [isDemoMode, setIsDemoMode] = useState(() => {
    const userExists = localStorage.getItem('aegis_user_exists') === 'true';
    if (userExists) {
      const savedMode = localStorage.getItem('aegis_demo_mode');
      return savedMode === 'true';
    }
    return true; // Default to Demo Mode if user does not exist
  });

  const [username, setUsername] = useState(() => {
    const userExists = localStorage.getItem('aegis_user_exists') === 'true';
    if (!userExists) return DEMO_USERNAME;
    return localStorage.getItem('user_username') || INITIAL_USER_USERNAME;
  });

  const [tasks, setTasks] = useState([]);
  const [events, setEvents] = useState([]);
  const [habits, setHabits] = useState([]);

  const isInitialized = useRef(false);

  // Sync workspace data based on Demo Mode / User Mode
  useEffect(() => {
    localStorage.setItem('aegis_demo_mode', isDemoMode ? 'true' : 'false');
    if (isDemoMode) {
      const savedTasks = localStorage.getItem('demo_tasks');
      const savedEvents = localStorage.getItem('demo_events');
      const savedHabits = localStorage.getItem('demo_habits');
      setTasks(savedTasks ? JSON.parse(savedTasks) : DEMO_TASKS);
      setEvents(savedEvents ? JSON.parse(savedEvents) : DEMO_EVENTS);
      setHabits(savedHabits ? JSON.parse(savedHabits) : DEMO_HABITS);
      setUsername(DEMO_USERNAME);
    } else {
      const savedTasks = localStorage.getItem('user_tasks');
      const savedEvents = localStorage.getItem('user_events');
      const savedHabits = localStorage.getItem('user_habits');
      const savedUsername = localStorage.getItem('user_username');
      setTasks(savedTasks ? JSON.parse(savedTasks) : INITIAL_USER_TASKS);
      setEvents(savedEvents ? JSON.parse(savedEvents) : INITIAL_USER_EVENTS);
      setHabits(savedHabits ? JSON.parse(savedHabits) : INITIAL_USER_HABITS);
      setUsername(savedUsername || INITIAL_USER_USERNAME);
    }
    isInitialized.current = true;
  }, [isDemoMode]);

  // Persist states to appropriate local storage namespaces
  useEffect(() => {
    if (!isInitialized.current) return;
    if (isDemoMode) {
      localStorage.setItem('demo_tasks', JSON.stringify(tasks));
    } else {
      localStorage.setItem('user_tasks', JSON.stringify(tasks));
      if (tasks.length > 0) {
        localStorage.setItem('aegis_user_exists', 'true');
      }
    }
  }, [tasks, isDemoMode]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (isDemoMode) {
      localStorage.setItem('demo_events', JSON.stringify(events));
    } else {
      localStorage.setItem('user_events', JSON.stringify(events));
    }
  }, [events, isDemoMode]);

  useEffect(() => {
    if (!isInitialized.current) return;
    if (isDemoMode) {
      localStorage.setItem('demo_habits', JSON.stringify(habits));
    } else {
      localStorage.setItem('user_habits', JSON.stringify(habits));
    }
  }, [habits, isDemoMode]);

  const loadDemoModeData = () => {
    localStorage.setItem('demo_tasks', JSON.stringify(DEMO_TASKS));
    localStorage.setItem('demo_events', JSON.stringify(DEMO_EVENTS));
    localStorage.setItem('demo_habits', JSON.stringify(DEMO_HABITS));
    setTasks(DEMO_TASKS);
    setEvents(DEMO_EVENTS);
    setHabits(DEMO_HABITS);
    setUsername(DEMO_USERNAME);
  };

  const handleUsernameChange = (newVal) => {
    setUsername(newVal);
    if (!isDemoMode) {
      localStorage.setItem('user_username', newVal);
      localStorage.setItem('aegis_user_exists', 'true');
    }
  };

  const [activeTab, setActiveTab] = useState('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState(() => formatDateStr(new Date()));
  const [calendarOpen, setCalendarOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const [coachTone, setCoachTone] = useState('guardian');
  const [ambientSoundType, setAmbientSoundType] = useState('ocean');
  const [taskDatePickerOpen, setTaskDatePickerOpen] = useState(false);
  const [taskCalendarMonth, setTaskCalendarMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });
  const [calendarViewMonth, setCalendarViewMonth] = useState(() => {
    const now = new Date();
    return { year: now.getFullYear(), month: now.getMonth() };
  });

  // Form states
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskPriority, setNewTaskPriority] = useState('medium');
  const [newTaskCategory, setNewTaskCategory] = useState('Work');
  const [newTaskDuration, setNewTaskDuration] = useState(30);
  const [newTaskDueDate, setNewTaskDueDate] = useState(() => formatDateStr(new Date()));
  const [newTaskCognitiveLoad, setNewTaskCognitiveLoad] = useState(3);
  const [newHabitTitle, setNewHabitTitle] = useState('');

  // What Should I Do Next Agent States
  const [nextRecommendationOpen, setNextRecommendationOpen] = useState(false);
  const [userEnergyLevel, setUserEnergyLevel] = useState(3);
  const [nextRecommendation, setNextRecommendation] = useState(null);
  const [nextRecLoading, setNextRecLoading] = useState(false);
  const [nextRecError, setNextRecError] = useState('');

  // Daily Briefing States
  const [briefingData, setBriefingData] = useState(null);
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingError, setBriefingError] = useState('');

  // Cognitive Load Engine States
  const [cognitiveLoadData, setCognitiveLoadData] = useState(null);
  const [cogLoadLoading, setCogLoadLoading] = useState(false);
  const [cogLoadError, setCogLoadError] = useState('');

  // Smart Recovery Agent States
  const [recoveryData, setRecoveryData] = useState(null);
  const [recoveryLoading, setRecoveryLoading] = useState(false);
  const [recoveryError, setRecoveryError] = useState('');

  // Weekly Optimizer Agent States
  const [weeklyOptData, setWeeklyOptData] = useState(null);
  const [weeklyOptLoading, setWeeklyOptLoading] = useState(false);
  const [weeklyOptError, setWeeklyOptError] = useState('');

  // Smart Task Estimation States
  const [isEstimating, setIsEstimating] = useState(false);
  const [estimatedMinutes, setEstimatedMinutes] = useState(0);
  const [estimatedComplexity, setEstimatedComplexity] = useState('Medium');
  const [estimatedCognitiveLoad, setEstimatedCognitiveLoad] = useState(3);
  const [estimatedConfidence, setEstimatedConfidence] = useState(0);
  const [overrideEstimation, setOverrideEstimation] = useState(false);
  const [estimationHistory, setEstimationHistory] = useState(() => JSON.parse(localStorage.getItem('estimation_history') || '[]'));

  // AI Chat states
  const [chatOpen, setChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState([
    {
      sender: 'assistant',
      text: "Welcome back, traveler. I am Aegis, your Zen companion. Breathe. I have reviewed your energy budget for today. Feel free to ask me to gently structure your day or start a box breathing exercise.",
      timestamp: new Date()
    }
  ]);
  const [isThinking, setIsThinking] = useState(false);

  // Sync estimation history
  useEffect(() => {
    localStorage.setItem('estimation_history', JSON.stringify(estimationHistory));
  }, [estimationHistory]);

  const fetchTaskEstimation = async (title, desc) => {
    if (!title.trim()) return;
    setIsEstimating(true);
    if (isDemoMode) {
      setTimeout(() => {
        const combined = (title + " " + desc).toLowerCase();
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
          estimatedMinutes = 30;
          complexity = "Low";
          cognitiveLoad = 1;
        }

        setEstimatedMinutes(estimatedMinutes);
        setEstimatedComplexity(complexity);
        setEstimatedCognitiveLoad(cognitiveLoad);
        setEstimatedConfidence(85);

        const newLog = {
          id: 'est_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title,
          description: desc,
          estimatedMinutes,
          complexity,
          cognitiveLoad,
          confidence: 85,
          timestamp: new Date().toISOString()
        };
        setEstimationHistory(prev => [newLog, ...prev]);
        setIsEstimating(false);
      }, 500);
      return;
    }
    try {
      const response = await fetch(API_BASE_URL + '/api/estimate-task', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({ title, description: desc })
      });
      const data = await response.json();
      if (response.ok) {
        setEstimatedMinutes(data.estimatedMinutes);
        setEstimatedComplexity(data.complexity);
        setEstimatedCognitiveLoad(data.cognitiveLoad);
        setEstimatedConfidence(data.confidence);

        const newLog = {
          id: 'est_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title,
          description: desc,
          estimatedMinutes: data.estimatedMinutes,
          complexity: data.complexity,
          cognitiveLoad: data.cognitiveLoad,
          confidence: data.confidence,
          timestamp: new Date().toISOString()
        };
        setEstimationHistory(prev => [newLog, ...prev]);
      }
    } catch (err) {
      console.error("Estimation failed:", err);
    } finally {
      setIsEstimating(false);
    }
  };

  useEffect(() => {
    if (!newTaskTitle.trim()) {
      setEstimatedMinutes(0);
      return;
    }
    const delayDebounceFn = setTimeout(() => {
      fetchTaskEstimation(newTaskTitle, newTaskDescription);
    }, 1000);

    return () => clearTimeout(delayDebounceFn);
  }, [newTaskTitle, newTaskDescription]);

  const handleFetchNextRecommendation = async () => {
    setNextRecLoading(true);
    setNextRecError('');
    setNextRecommendation(null);
    if (isDemoMode) {
      const pending = tasks.filter(t => t.status !== 'completed');
      if (pending.length === 0) {
        setNextRecommendation({
          task: "Practice 1-Minute Box Breathing",
          reason: [
            "All pending tasks are completed",
            "Restore cognitive balance",
            "Clear mental pathways for tomorrow"
          ],
          estimatedDuration: 15
        });
      } else {
        const scored = pending.map(t => {
          let score = 0;
          if (t.priority === 'high') score += 100;
          else if (t.priority === 'medium') score += 50;
          else score += 10;

          const taskLoad = t.cognitiveLoad || 3;
          const loadDiff = Math.abs(taskLoad - userEnergyLevel);
          score += (5 - loadDiff) * 15;

          return { task: t, score };
        });
        scored.sort((a, b) => b.score - a.score);
        const bestTask = scored[0].task;
        setNextRecommendation({
          task: bestTask.title,
          reason: [
            bestTask.priority === 'high' ? "Highest pending urgency priority" : "Good task to progress flow balance",
            `Perfect load match for your ⚡ ${userEnergyLevel}/5 current energy`,
            "Estimated duration fits nicely in a focus block"
          ],
          estimatedDuration: bestTask.duration || 45
        });
      }
      setNextRecLoading(false);
      return;
    }
    try {
      const response = await fetch(API_BASE_URL + '/api/recommend-next', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          tasks: tasks,
          energyLevel: userEnergyLevel
        })
      });
      const data = await response.json();
      if (response.ok) {
        setNextRecommendation(data);
      } else {
        setNextRecError(data.error || "Failed to fetch recommendation.");
      }
    } catch (err) {
      console.error(err);
      setNextRecError("Backend recommendation service offline.");
    } finally {
      setNextRecLoading(false);
    }
  };

  useEffect(() => {
    if (nextRecommendationOpen) {
      handleFetchNextRecommendation();
    }
  }, [nextRecommendationOpen, userEnergyLevel]);

  const handleStartNextTask = (taskTitle, duration) => {
    const match = tasks.find(t => t.title.toLowerCase() === taskTitle.toLowerCase() && t.status !== 'completed');
    const finalTaskId = match ? match.id : ('task_next_' + Date.now());

    if (!match) {
      const newTask = {
        id: finalTaskId,
        title: taskTitle,
        priority: 'medium',
        category: 'Work',
        dueDate: formatDateStr(new Date()),
        duration: duration || 45,
        cognitiveLoad: userEnergyLevel,
        status: 'in_progress',
        subtasks: []
      };
      setTasks(prev => [...prev, newTask]);
    } else {
      setTasks(prev => prev.map(t => t.id === finalTaskId ? { ...t, status: 'in_progress' } : t));
    }

    const now = new Date();
    const newEvent = {
      id: 'event_next_' + Date.now(),
      taskId: finalTaskId,
      title: taskTitle,
      startTime: `${formatDateStr(now)}T${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00`,
      duration: duration || 45
    };
    setEvents(prev => [...prev, newEvent]);

    addHistoryLog('plan', `What Next Agent: Commited focus block for "${taskTitle}".`);
    speakText(`Excellent choice. Let's dedicate ${duration || 45} minutes to focus on "${taskTitle}". You've got this.`);

    setNextRecommendationOpen(false);
  };

  const fetchDailyBriefing = async () => {
    if (isDemoMode) {
      setBriefingData(DEMO_BRIEFING);
      setBriefingLoading(false);
      setBriefingError('');
      return;
    }
    setBriefingLoading(true);
    setBriefingError('');
    try {
      const response = await fetch(API_BASE_URL + '/api/briefing', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          tasks,
          habits,
          history,
          selectedDate,
          username
        })
      });
      const data = await response.json();
      if (response.ok) {
        setBriefingData(data);
      } else {
        setBriefingError(data.error || "Failed to fetch daily briefing.");
      }
    } catch (err) {
      console.error(err);
      setBriefingError("Briefing engine offline.");
    } finally {
      setBriefingLoading(false);
    }
  };

  useEffect(() => {
    fetchDailyBriefing();
  }, [selectedDate, apiKey, username, isDemoMode]);

  const fetchCognitiveLoadData = async () => {
    if (isDemoMode) {
      setCognitiveLoadData({
        cognitiveLoad: 45,
        level: 'Moderate',
        explanation: 'Your schedule shows a moderate cognitive load of 45/100. This is balanced, but you should take micro-breaks between your tasks.',
        recommendations: [
          'Take a breathing break after finishing your landing page redesign.',
          'Review AI task duration recommendations.'
        ]
      });
      setCogLoadLoading(false);
      setCogLoadError('');
      return;
    }
    setCogLoadLoading(true);
    setCogLoadError('');
    try {
      const response = await fetch(API_BASE_URL + '/api/cognitive-load', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({ tasks, events })
      });
      const data = await response.json();
      if (response.ok) {
        setCognitiveLoadData(data);
      } else {
        setCogLoadError(data.error || "Failed to analyze cognitive load.");
      }
    } catch (err) {
      console.error(err);
      setCogLoadError("Cognitive diagnostic engine offline.");
    } finally {
      setCogLoadLoading(false);
    }
  };

  useEffect(() => {
    fetchCognitiveLoadData();
  }, [tasks, events, apiKey, isDemoMode]);

  const handleFetchRecoveryPlan = async (missedTaskTitle) => {
    setRecoveryLoading(true);
    setRecoveryError('');
    setRecoveryData(null);
    if (isDemoMode) {
      setRecoveryData({
        missedTask: missedTaskTitle,
        adjustments: [
          `Postpone low priority habits to tomorrow.`,
          `Re-allocate 30 minutes to review tomorrow's planned tasks.`
        ]
      });
      setRecoveryLoading(false);
      return;
    }
    try {
      const response = await fetch(API_BASE_URL + '/api/recovery', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          tasks,
          events,
          missedTask: missedTaskTitle
        })
      });
      const data = await response.json();
      if (response.ok) {
        setRecoveryData(data);
      } else {
        setRecoveryError(data.error || "Failed to analyze recovery plan.");
      }
    } catch (err) {
      console.error(err);
      setRecoveryError("Recovery service offline.");
    } finally {
      setRecoveryLoading(false);
    }
  };

  useEffect(() => {
    const now = new Date();
    const missed = events.filter(e => {
      const end = new Date(new Date(e.startTime).getTime() + (e.duration || 30) * 60 * 1000);
      if (end < now) {
        const task = tasks.find(t => t.id === e.taskId);
        return task && task.status !== 'completed';
      }
      return false;
    });

    if (missed.length > 0 && !recoveryData && !recoveryLoading && !recoveryError) {
      const taskMatch = tasks.find(t => t.id === missed[0].taskId);
      if (taskMatch) {
        handleFetchRecoveryPlan(taskMatch.title);
      }
    } else if (missed.length === 0 && recoveryData) {
      setRecoveryData(null);
    }
  }, [tasks, events, apiKey]);

  const handleApplyRecoveryReplan = () => {
    if (!recoveryData || !recoveryData.timelineUpdates) return;

    // Apply rescheduling updates to events list
    setEvents(prev => prev.map(evt => {
      const update = recoveryData.timelineUpdates.find(upd => upd.taskId === evt.taskId);
      if (update) {
        return {
          ...evt,
          startTime: update.newStartTime
        };
      }
      return evt;
    }));

    addHistoryLog('reschedule', `Smart Recovery: Re-scheduled "${recoveryData.missedTask}". Adjustments: ${recoveryData.adjustments.join(', ')}.`);
    speakText(`Rescheduling approved. I have rescheduled "${recoveryData.missedTask}" to tomorrow.`);

    setRecoveryData(null);
  };

  const handleOptimizeWeek = async () => {
    setWeeklyOptLoading(true);
    setWeeklyOptError('');
    setWeeklyOptData(null);
    if (isDemoMode) {
      setWeeklyOptData({
        weeklyPlanSummary: "Focus on finalizing the landing page first, then review AI recommendations. Lower priority tasks have been scheduled for late week slots to maximize early week cognitive focus.",
        riskAssessment: "Risk: Over-allocating work on landing page could result in moderate burnout. Mitigate with regular breaks.",
        priorityChanges: [
          "Set landing page task to High priority",
          "Postpone admin tasks to Friday"
        ],
        focusList: ["Aegis Zen landing page redesign", "AI suggestions review"],
        postponeList: ["Smart planner scheduling review"],
        ignoreList: ["General sorting", "Admin review"]
      });
      setWeeklyOptLoading(false);
      setWeeklyOptError('');
      return;
    }
    try {
      const response = await fetch(API_BASE_URL + '/api/optimize-week', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({ tasks, habits, goals: habits.map(h => ({ title: h.title })) })
      });
      const data = await response.json();
      if (response.ok) {
        setWeeklyOptData(data);
      } else {
        setWeeklyOptError(data.error || "Failed to optimize week.");
      }
    } catch (err) {
      console.error(err);
      setWeeklyOptError("Optimizer service offline.");
    } finally {
      setWeeklyOptLoading(false);
    }
  };

  // AI Planner States
  const [plannerSchedule, setPlannerSchedule] = useState([]);
  const [plannerSummary, setPlannerSummary] = useState('');
  const [plannerLoading, setPlannerLoading] = useState(false);
  const [plannerError, setPlannerError] = useState('');
  const [plannerPhraseIndex, setPlannerPhraseIndex] = useState(0);

  // Adaptive Rescheduling & History States
  const [history, setHistory] = useState(() => JSON.parse(localStorage.getItem('schedule_history') || '[]'));
  const [rescheduleNotification, setRescheduleNotification] = useState(null);

  // Burnout Prediction Engine States
  const [burnoutData, setBurnoutData] = useState(null);
  const [burnoutLoading, setBurnoutLoading] = useState(false);
  const [burnoutError, setBurnoutError] = useState('');

  // Deadline Survival Mode States
  const [survivalModeActive, setSurvivalModeActive] = useState(false);
  const [survivalData, setSurvivalData] = useState(null);
  const [survivalLoading, setSurvivalLoading] = useState(false);

  // Future Self Simulator States
  const [simulationData, setSimulationData] = useState(null);
  const [simulationLoading, setSimulationLoading] = useState(false);
  const [simulationError, setSimulationError] = useState('');

  // Inbox to Action States
  const [inboxText, setInboxText] = useState('');
  const [inboxResult, setInboxResult] = useState(null);
  const [inboxLoading, setInboxLoading] = useState(false);
  const [inboxError, setInboxError] = useState('');

  // Brain Dump States
  const [brainDumpText, setBrainDumpText] = useState('');
  const [brainDumpResult, setBrainDumpResult] = useState(null);
  const [brainDumpLoading, setBrainDumpLoading] = useState(false);
  const [brainDumpError, setBrainDumpError] = useState('');

  // Voice Accountability Coach States
  const [voiceCoachOpen, setVoiceCoachOpen] = useState(false);
  const [voiceCoachMessage, setVoiceCoachMessage] = useState('Welcome. Tap below to start your focus accountability check-in.');
  const [voiceCoachUserMessage, setVoiceCoachUserMessage] = useState('');
  const [voiceCoachListening, setVoiceCoachListening] = useState(false);
  const [voiceCoachLogs, setVoiceCoachLogs] = useState([]);
  const [voiceCoachTask, setVoiceCoachTask] = useState(null);
  const [voiceCoachStatusText, setVoiceCoachStatusText] = useState('Aegis is resting');

  // Voice states
  const [speechEnabled, setSpeechEnabled] = useState(true);
  const [isListening, setIsListening] = useState(false);
  const [voiceSpeed, setVoiceSpeed] = useState(0.95);
  const [selectedVoice, setSelectedVoice] = useState('');
  const [voices, setVoices] = useState([]);

  // Mindfulness Zen States
  const [breathingActive, setBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState('inhale');
  const [breathingTimer, setBreathingTimer] = useState(60);
  const [ambientActive, setAmbientActive] = useState(false);

  const chatEndRef = useRef(null);
  const agentRef = useRef(null);
  const ambientControllerRef = useRef(null);

  const plannerLoadingPhrases = [
    "Inhaling clarity... Aegis is organizing your day...",
    "Balancing cognitive points to preserve your energy...",
    "Harmonizing schedules to secure restful spacing...",
    "Exhaling stress... Almost ready..."
  ];

  // Synchronize localStorage
  useEffect(() => {
    localStorage.setItem('tasks', JSON.stringify(tasks));
  }, [tasks]);

  useEffect(() => {
    localStorage.setItem('events', JSON.stringify(events));
  }, [events]);

  useEffect(() => {
    localStorage.setItem('habits', JSON.stringify(habits));
  }, [habits]);

  // Handle Speech voices
  useEffect(() => {
    if (typeof window !== 'undefined' && window.speechSynthesis) {
      const loadVoices = () => {
        const list = window.speechSynthesis.getVoices();
        setVoices(list);
        if (list.length > 0 && !selectedVoice) {
          const defaultVoice = list.find(v => v.lang.includes('en-US')) || list[0];
          setSelectedVoice(defaultVoice.name);
        }
      };
      loadVoices();
      window.speechSynthesis.onvoiceschanged = loadVoices;
    }
  }, []);

  // Web Audio Ocean Wave Synthesizer
  const startOceanWaves = () => {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    if (!AudioContext) return null;
    try {
      const ctx = new AudioContext();

      const bufferSize = 2 * ctx.sampleRate;
      const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
      const output = noiseBuffer.getChannelData(0);
      for (let i = 0; i < bufferSize; i++) {
        output[i] = Math.random() * 2 - 1;
      }

      const whiteNoise = ctx.createBufferSource();
      whiteNoise.buffer = noiseBuffer;
      whiteNoise.loop = true;

      const filter = ctx.createBiquadFilter();
      filter.type = 'lowpass';
      filter.frequency.value = 350;

      const osc = ctx.createOscillator();
      osc.frequency.value = 0.16;

      const oscGain = ctx.createGain();
      oscGain.gain.value = 180;

      osc.connect(oscGain);
      oscGain.connect(filter.frequency);

      const volumeGain = ctx.createGain();
      volumeGain.gain.value = 0.1;

      const volOscGain = ctx.createGain();
      volOscGain.gain.value = 0.06;

      osc.connect(volOscGain);
      volOscGain.connect(volumeGain.gain);

      whiteNoise.connect(filter);
      filter.connect(volumeGain);
      volumeGain.connect(ctx.destination);

      whiteNoise.start();
      osc.start();

      return {
        stop: () => {
          try {
            whiteNoise.stop();
            osc.stop();
            ctx.close();
          } catch (err) {
            console.error("Error stopping synth:", err);
          }
        }
      };
    } catch (e) {
      console.error("Web Audio API not supported:", e);
      return null;
    }
  };

  // Manage Ambient Audio Synth
  useEffect(() => {
    if (ambientActive) {
      const controller = startOceanWaves();
      if (controller) {
        ambientControllerRef.current = controller;
      } else {
        setAmbientActive(false);
      }
    } else {
      if (ambientControllerRef.current) {
        ambientControllerRef.current.stop();
        ambientControllerRef.current = null;
      }
    }

    return () => {
      if (ambientControllerRef.current) {
        ambientControllerRef.current.stop();
      }
    };
  }, [ambientActive]);

  // Guided Box Breathing timer
  useEffect(() => {
    let timerInterval = null;
    let phaseInterval = null;

    if (breathingActive) {
      setBreathingPhase('inhale');

      timerInterval = setInterval(() => {
        setBreathingTimer(prev => {
          if (prev <= 1) {
            clearInterval(timerInterval);
            clearInterval(phaseInterval);
            setBreathingActive(false);

            const todayStr = formatDateStr(new Date());
            setHabits(prevHabits => prevHabits.map(h => {
              if (h.id === 'h_1') {
                const exists = h.history.includes(todayStr);
                const history = exists ? h.history : [...h.history, todayStr];
                const streak = exists ? h.streak : h.streak + 1;
                return { ...h, history, streak };
              }
              return h;
            }));

            setMessages(prev => [...prev, {
              sender: 'assistant',
              text: "A beautiful breath. I've updated your daily breathing habit tracker. Streaks incremented! Let's return to our tasks with clarity.",
              timestamp: new Date()
            }]);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      let phaseIdx = 0;
      const phases = ['inhale', 'hold1', 'exhale', 'hold2'];
      phaseInterval = setInterval(() => {
        phaseIdx = (phaseIdx + 1) % 4;
        setBreathingPhase(phases[phaseIdx]);
      }, 4000);
    }

    return () => {
      if (timerInterval) clearInterval(timerInterval);
      if (phaseInterval) clearInterval(phaseInterval);
    };
  }, [breathingActive]);

  // Loading text phrases rotator
  useEffect(() => {
    let interval = null;
    if (plannerLoading) {
      interval = setInterval(() => {
        setPlannerPhraseIndex(prev => (prev + 1) % plannerLoadingPhrases.length);
      }, 3000);
    }
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [plannerLoading]);

  // Schedule Analyzer: Overdue task detection engine
  useEffect(() => {
    const now = new Date();

    const overdueEvents = events.filter(e => {
      if (!e.startTime.startsWith(selectedDate)) return false;

      const start = new Date(e.startTime);
      const end = new Date(start.getTime() + (e.duration || 30) * 60 * 1000);

      if (end < now) {
        const associatedTask = tasks.find(t => t.id === e.taskId);
        return associatedTask && associatedTask.status !== 'completed';
      }
      return false;
    });

    if (overdueEvents.length > 0) {
      setRescheduleNotification({
        active: true,
        missed: overdueEvents.map(e => ({
          eventId: e.id,
          taskId: e.taskId,
          title: e.title
        })),
        recommendations: null,
        explanation: '',
        loading: false,
        error: ''
      });
    } else {
      setRescheduleNotification(null);
    }
  }, [events, tasks, selectedDate]);

  // Burnout Prediction Engine Effect Integration
  useEffect(() => {
    const fetchBurnoutStats = async () => {
      setBurnoutLoading(true);
      if (isDemoMode) {
        setBurnoutData({
          burnoutScore: 28,
          category: "Healthy",
          metricsSummary: {
            workloadChange: "Your workload has increased by 12% this week.",
            cognitiveStress: "Your active cognitive demand is at 9 focus points.",
            completionRatio: "You have completed 75% of registered tasks."
          },
          recommendations: [
            "You are maintaining a balanced workflow. Continue practicing mindful focus."
          ],
          trendData: [
            { day: "Mon", score: 25 },
            { day: "Tue", score: 32 },
            { day: "Wed", score: 28 },
            { day: "Thu", score: 35 },
            { day: "Fri", score: 30 },
            { day: "Sat", score: 22 },
            { day: "Sun", score: 28 }
          ],
          mindfulExplanation: "Aegis has analyzed your focus cycles. With an active cognitive demand of 9 units and 0 overdue focus blocks, your burnout risk is Healthy. I suggest maintaining this pace."
        });
        setBurnoutLoading(false);
        setBurnoutError('');
        return;
      }
      try {
        const response = await fetch(API_BASE_URL + '/api/burnout', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': apiKey
          },
          body: JSON.stringify({ tasks, events, habits })
        });
        const data = await response.json();

        if (response.ok) {
          setBurnoutData(data);
          setBurnoutError('');
        } else {
          setBurnoutError(data.error || "Failed to analyze burnout index.");
        }
      } catch (err) {
        console.error("Failed to connect to burnout engine:", err);
        setBurnoutError("Backend offline");
      } finally {
        setBurnoutLoading(false);
      }
    };

    fetchBurnoutStats();
  }, [tasks, events, habits, apiKey, isDemoMode]);

  // Deadline Survival Mode Effect Integration
  useEffect(() => {
    const fetchSurvivalMetrics = async () => {
      if (!survivalModeActive) return;
      setSurvivalLoading(true);
      if (isDemoMode) {
        const criticalTasks = tasks.filter(t => t.priority === 'high' && t.status !== 'completed');
        setSurvivalData({
          completionProbability: 92,
          remainingWorkMinutes: criticalTasks.reduce((acc, t) => acc + (t.duration || 30), 0),
          recommendedActions: [
            "Hide low-value and easy flow tasks from your workspace to clear mental noise.",
            "Pause habit checks: Aegis has locked habits to avoid splitting your focus.",
            "Compress rest timers: Shift your focus block breaks to 5-minute segments.",
            "Practice standard box breathing to suppress rising deadline panic."
          ],
          mindfulSurvivalExplanation: `Emergency Survival Mode Active. Aegis has filtered your display to isolate ${criticalTasks.length} critical deadline task(s). Keep focus narrow.`
        });
        setSurvivalLoading(false);
        return;
      }
      try {
        const response = await fetch(API_BASE_URL + '/api/survival', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': apiKey
          },
          body: JSON.stringify({ tasks, events })
        });
        const data = await response.json();

        if (response.ok) {
          setSurvivalData(data);
        }
      } catch (err) {
        console.error("Failed to retrieve survival metrics:", err);
      } finally {
        setSurvivalLoading(false);
      }
    };

    fetchSurvivalMetrics();
  }, [tasks, events, survivalModeActive, apiKey, isDemoMode]);

  // Initialize companion agent
  useEffect(() => {
    const callbacks = {
      onAddTask: (args) => {
        const newTask = {
          id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          title: args.title,
          priority: args.priority || 'medium',
          category: args.category || 'General',
          dueDate: args.dueDate || formatDateStr(new Date()),
          duration: Number(args.duration) || 30,
          cognitiveLoad: Number(args.cognitiveLoad) || 3,
          status: 'todo',
          subtasks: []
        };
        setTasks(prev => [...prev, newTask]);
        return { success: true, task: newTask };
      },
      onScheduleTask: (args) => {
        const newEvent = {
          id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
          taskId: args.taskId,
          title: 'Scheduled Task',
          startTime: args.startTime,
          duration: Number(args.duration) || 30
        };

        const allTasks = JSON.parse(localStorage.getItem('tasks') || '[]');
        const task = allTasks.find(t => t.id === args.taskId);
        newEvent.title = task ? task.title : 'Scheduled Task';

        setEvents(prev => [...prev, newEvent]);
        setTasks(prev => prev.map(t => t.id === args.taskId ? { ...t, status: 'in_progress' } : t));
        return { success: true, event: newEvent };
      },
      onUpdateTask: (args) => {
        let found = false;
        setTasks(prev => prev.map(t => {
          if (t.id === args.taskId) {
            found = true;
            return {
              ...t,
              ...(args.title && { title: args.title }),
              ...(args.status && { status: args.status }),
              ...(args.priority && { priority: args.priority }),
              ...(args.category && { category: args.category }),
              ...(args.dueDate && { dueDate: args.dueDate }),
              ...(args.cognitiveLoad && { cognitiveLoad: Number(args.cognitiveLoad) })
            };
          }
          return t;
        }));
        return found ? { success: true } : { error: "Task not found" };
      },
      onDeleteTask: (args) => {
        setTasks(prev => prev.filter(t => t.id !== args.taskId));
        setEvents(prev => prev.filter(e => e.taskId !== args.taskId));
        return { success: true };
      },
      getTasksList: () => {
        return JSON.parse(localStorage.getItem('tasks') || '[]');
      },
      getEventsList: () => {
        return JSON.parse(localStorage.getItem('events') || '[]');
      },
      onTriggerBreathing: () => {
        setBreathingActive(true);
        setBreathingTimer(60);
        setChatOpen(false);
        return { success: true };
      }
    };

    agentRef.current = new ProductivityAgent(apiKey, callbacks);
  }, [apiKey]);

  // Scroll to bottom of chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const speakText = (text) => {
    if (!speechEnabled || !window.speechSynthesis) return;
    window.speechSynthesis.cancel();
    const cleanText = text.replace(/[*#`_\-]/g, '');
    const utterance = new SpeechSynthesisUtterance(cleanText);
    if (selectedVoice) {
      const voice = voices.find(v => v.name === selectedVoice);
      if (voice) utterance.voice = voice;
    }
    utterance.rate = voiceSpeed;
    window.speechSynthesis.speak(utterance);
  };

  const handleSendChatMessage = async (text) => {
    const inputMsg = text || chatInput;
    if (!inputMsg.trim()) return;

    const userMsg = { sender: 'user', text: inputMsg, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsThinking(true);

    if (isDemoMode) {
      setTimeout(() => {
        setIsThinking(false);
        const demoReplyText = `As your Aegis Productivity Companion, I am here to guide your focus. 

Your current list contains 4 tasks, with a balanced workload of 9 energy units. I recommend focusing on **Finish Aegis Zen landing page redesign** first. 

Would you like to take a 1-minute box breathing break to ground your attention?`;
        const assistantMsg = {
          sender: 'assistant',
          text: demoReplyText,
          timestamp: new Date()
        };
        setMessages(prev => [...prev, assistantMsg]);
        speakText(demoReplyText);
      }, 1200);
      return;
    }

    if (!apiKey) {
      setIsThinking(false);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "Please set your Gemini API Key in the settings tab or the sidebar to unlock the Zen coaching companion.",
        timestamp: new Date()
      }]);
      return;
    }

    try {
      const result = await agentRef.current.handleUserMessage(inputMsg);
      setIsThinking(false);

      const assistantMsg = {
        sender: 'assistant',
        text: result.text,
        timestamp: new Date()
      };
      setMessages(prev => [...prev, assistantMsg]);
      speakText(result.text);
    } catch (e) {
      setIsThinking(false);
      setMessages(prev => [...prev, {
        sender: 'assistant',
        text: "I experienced a ripple in the grid. Please rephrase your words.",
        timestamp: new Date()
      }]);
    }
  };

  // Speech Recognition dictation
  const toggleSpeechRecognition = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Speech recognition is not supported in this browser. Try Google Chrome.");
      return;
    }

    if (isListening) {
      window.recognitionInstance?.stop();
      setIsListening(false);
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => setIsListening(true);
    rec.onend = () => setIsListening(false);
    rec.onresult = (event) => {
      const text = event.results[0][0].transcript;
      handleSendChatMessage(text);
    };
    rec.onerror = (e) => {
      console.error(e);
      setIsListening(false);
    };

    window.recognitionInstance = rec;
    rec.start();
  };

  // Manual modifications
  const handleCreateTaskManually = (e) => {
    e.preventDefault();
    if (!newTaskTitle.trim()) return;

    const finalDuration = overrideEstimation
      ? (Number(newTaskDuration) || 30)
      : (estimatedMinutes || 30);

    const finalCognitiveLoad = overrideEstimation
      ? (Number(newTaskCognitiveLoad) || 3)
      : (estimatedCognitiveLoad || 3);

    const newTask = {
      id: 'task_' + Date.now(),
      title: newTaskTitle,
      description: newTaskDescription,
      priority: newTaskPriority,
      category: newTaskCategory,
      dueDate: newTaskDueDate,
      duration: finalDuration,
      cognitiveLoad: finalCognitiveLoad,
      status: 'todo',
      subtasks: []
    };

    setTasks(prev => [...prev, newTask]);
    setNewTaskTitle('');
    setNewTaskDescription('');
    setOverrideEstimation(false);
    setEstimatedMinutes(0);
  };

  const handleDeleteTask = (id) => {
    setTasks(prev => prev.filter(t => t.id !== id));
    setEvents(prev => prev.filter(e => e.taskId !== id));
  };

  const handleUpdateStatus = (id, newStatus) => {
    setTasks(prev => prev.map(t => {
      if (t.id === id) {
        return { ...t, status: newStatus };
      }
      return t;
    }));
  };

  const handleToggleSubtask = (taskId, subtaskId) => {
    setTasks(prev => prev.map(t => {
      if (t.id === taskId) {
        return {
          ...t,
          subtasks: (t.subtasks || []).map(s =>
            s.id === subtaskId ? { ...s, completed: !s.completed } : s
          )
        };
      }
      return t;
    }));
  };

  const handleToggleHabitDay = (habitId, dateStr) => {
    if (survivalModeActive) return;

    setHabits(prev => prev.map(h => {
      if (h.id === habitId) {
        const exists = h.history.includes(dateStr);
        const newHistory = exists
          ? h.history.filter(d => d !== dateStr)
          : [...h.history, dateStr];
        const newStreak = exists ? Math.max(0, h.streak - 1) : h.streak + 1;
        return { ...h, history: newHistory, streak: newStreak };
      }
      return h;
    }));
  };

  const handleAddHabit = (e) => {
    e.preventDefault();
    if (!newHabitTitle.trim()) return;
    const newHabit = {
      id: 'h_' + Date.now(),
      title: newHabitTitle.trim(),
      streak: 0,
      history: []
    };
    setHabits(prev => [...prev, newHabit]);
    setNewHabitTitle('');
  };

  const handleRemoveHabit = (habitId) => {
    setHabits(prev => prev.filter(h => h.id !== habitId));
  };

  const handleAutoSchedule = () => {
    const unscheduled = tasks.filter(t => t.status !== 'completed' && !events.some(e => e.taskId === t.id));
    if (unscheduled.length === 0) {
      alert("All active tasks are currently scheduled on the calendar.");
      return;
    }

    let startHour = 9;
    let startMin = 0;
    const dateStr = selectedDate;

    const newScheduledEvents = [];
    const updatedTasks = [...tasks];

    unscheduled.forEach(task => {
      let startTimeISO = `${dateStr}T${startHour.toString().padStart(2, '0')}:${startMin.toString().padStart(2, '0')}:00`;

      newScheduledEvents.push({
        id: 'event_' + Math.random().toString(36).substr(2, 5),
        taskId: task.id,
        title: task.title,
        startTime: startTimeISO,
        duration: task.duration || 30
      });

      const totalMinutes = startMin + (task.duration || 30);
      startHour += Math.floor(totalMinutes / 60);
      startMin = totalMinutes % 60;

      const index = updatedTasks.findIndex(t => t.id === task.id);
      if (index !== -1) {
        updatedTasks[index].status = 'in_progress';
      }
    });

    setEvents(prev => [...prev, ...newScheduledEvents]);
    setTasks(updatedTasks);
  };

  const handleResetStorage = () => {
    if (confirm("Reset local database to default Zen templates?")) {
      setTasks(DEFAULT_TASKS);
      setEvents(DEFAULT_EVENTS);
      setHabits(DEFAULT_HABITS);
      setPlannerSchedule([]);
      setPlannerSummary('');
      setHistory([]);
      setBurnoutData(null);
      setSurvivalModeActive(false);
      setSurvivalData(null);
      setSimulationData(null);
      setInboxResult(null);
      setInboxText('');
      setVoiceCoachLogs([]);
      setVoiceCoachTask(null);
      setBrainDumpResult(null);
      setBrainDumpText('');
      localStorage.removeItem('schedule_history');
      setMessages([{
        sender: 'assistant',
        text: "My space is cleared. The layout returns to defaults. Let's build a peaceful workflow together.",
        timestamp: new Date()
      }]);
    }
  };

  // Schedule History Storage Helper
  const addHistoryLog = (type, description) => {
    const newLog = {
      id: 'hist_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      timestamp: new Date().toISOString(),
      type: type,
      description: description
    };
    setHistory(prev => {
      const updated = [newLog, ...prev];
      localStorage.setItem('schedule_history', JSON.stringify(updated));
      return updated;
    });
  };

  // AI Planner Integration Request
  const handleGenerateAIPlan = async () => {
    setPlannerLoading(true);
    setPlannerError('');
    setPlannerSchedule([]);
    setPlannerSummary('');

    if (isDemoMode) {
      const scheduledList = [
        {
          taskId: 'task_demo_1',
          title: 'Finish Aegis Zen landing page redesign',
          startTime: `${selectedDate}T14:00:00`,
          endTime: `${selectedDate}T15:00:00`,
          type: 'task',
          duration: 60
        },
        {
          taskId: '',
          title: 'Rest & Breathing Break',
          startTime: `${selectedDate}T15:00:00`,
          endTime: `${selectedDate}T15:15:00`,
          type: 'break',
          duration: 15
        },
        {
          taskId: 'task_demo_4',
          title: 'Plan tomorrow\'s focus schedule with Aegis smart planner',
          startTime: `${selectedDate}T15:15:00`,
          endTime: `${selectedDate}T15:35:00`,
          type: 'task',
          duration: 20
        }
      ];
      setPlannerSchedule(scheduledList);
      setPlannerSummary('Aegis has aligned today\'s plan to optimize your focus hours. Start with the landing page design at 2:00 PM.');
      setPlannerLoading(false);
      return;
    }

    if (!apiKey) {
      alert("Please configure your Google AI Studio API Key in settings first.");
      setActiveTab('settings');
      setPlannerLoading(false);
      return;
    }

    const pendingTasks = tasks.filter(t =>
      t.status !== 'completed' &&
      t.dueDate <= selectedDate &&
      (!survivalModeActive || t.priority === 'high')
    );

    if (pendingTasks.length === 0) {
      setPlannerLoading(false);
      setPlannerError("No active tasks to plan. Try adding some tasks first!");
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/api/planner', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          tasks: pendingTasks,
          selectedDate: selectedDate,
          survivalModeActive: survivalModeActive
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to generate plan");
      }

      setPlannerSchedule(data.schedule || []);
      setPlannerSummary(data.mindfulSummary || '');
      setPlannerLoading(false);

    } catch (e) {
      console.error(e);
      setPlannerLoading(false);
      setPlannerError(e.message || "Failed to connect to the backend planner service.");
    }
  };

  // Commit AI Generated Plan
  const handleCommitAIPlan = () => {
    if (plannerSchedule.length === 0) return;

    const filteredEvents = events.filter(e => !e.startTime.startsWith(selectedDate));

    const newEvents = plannerSchedule.map(item => ({
      id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
      taskId: item.taskId || null,
      title: item.title,
      startTime: item.startTime,
      duration: item.duration
    }));

    setEvents([...filteredEvents, ...newEvents]);

    const scheduledTaskIds = plannerSchedule
      .filter(item => item.type === 'task' && item.taskId)
      .map(item => item.taskId);

    setTasks(prev => prev.map(t =>
      scheduledTaskIds.includes(t.id) && t.status === 'todo'
        ? { ...t, status: 'in_progress' }
        : t
    ));

    const logText = survivalModeActive
      ? `Survival Mode active. Commited compressed Focus day schedule.`
      : `Generated daily flow plan with ${plannerSchedule.length} blocks.`;
    addHistoryLog('plan', logText);

    alert("Daily focus blocks successfully commited and harmonized onto your calendar planner!");
    setActiveTab('calendar');
  };

  // Fetch Adaptive Rescheduling Recommendations
  const handleFetchRescheduleRecommendations = async () => {
    if (!rescheduleNotification) return;

    setRescheduleNotification(prev => ({
      ...prev,
      loading: true,
      error: ''
    }));

    if (isDemoMode) {
      setTimeout(() => {
        const current = new Date();
        const recommendations = [];

        events.forEach(event => {
          if (event.startTime.startsWith(selectedDate)) {
            const start = new Date(event.startTime);
            const end = new Date(start.getTime() + (event.duration || 30) * 60 * 1000);
            
            if (end < current) {
              const task = tasks.find(t => t.id === event.taskId);
              if (task && task.status !== 'completed') {
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

        setRescheduleNotification(prev => ({
          ...prev,
          loading: false,
          recommendations: recommendations,
          explanation: "I detected overdue focus blocks. I recommend drifting them to open slots or moving them to tomorrow morning so you can rest tonight."
        }));
      }, 500);
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/api/reschedule', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          tasks: tasks,
          events: events,
          selectedDate: selectedDate,
          currentTime: new Date().toISOString()
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to fetch rescheduling options");
      }

      setRescheduleNotification(prev => ({
        ...prev,
        loading: false,
        recommendations: data.recommendations || [],
        explanation: data.mindfulExplanation || ''
      }));

    } catch (e) {
      console.error(e);
      setRescheduleNotification(prev => ({
        ...prev,
        loading: false,
        error: e.message || "Failed to retrieve rescheduling recommendation."
      }));
    }
  };

  // Apply Adaptive Rescheduling Recommendations
  const handleApplyReschedule = () => {
    if (!rescheduleNotification || !rescheduleNotification.recommendations) return;

    let updatedTasks = [...tasks];
    let updatedEvents = [...events];

    rescheduleNotification.recommendations.forEach(rec => {
      const { taskId, action } = rec;

      if (action.newDueDate) {
        updatedTasks = updatedTasks.map(t =>
          t.id === taskId
            ? { ...t, dueDate: action.newDueDate, status: 'todo' }
            : t
        );
      }

      if (action.newStartTime) {
        updatedEvents = updatedEvents.map(e => {
          if (e.taskId === taskId && e.startTime.startsWith(selectedDate)) {
            return {
              ...e,
              startTime: action.newStartTime
            };
          }
          return e;
        });
      }
    });

    setTasks(updatedTasks);
    setEvents(updatedEvents);

    const logText = `AI Adaptive Rescheduling: Modified ${rescheduleNotification.recommendations.length} overdue task(s).`;
    addHistoryLog('reschedule', logText);

    setRescheduleNotification(null);
    alert("Rescheduling updates applied! Your daily timeline and history logs have been updated.");
  };

  const handlePredictSimulation = async () => {
    setSimulationLoading(true);
    setSimulationError('');
    setSimulationData(null);

    if (isDemoMode) {
      setTimeout(() => {
        setSimulationData({
          scenarioA: {
            title: "Scenario A: Aegis Recommended Workflow",
            completionProbability: 86,
            stressLevel: 22,
            goalSuccessRate: 89,
            narrativeInsight: "Aegis advises dynamic rescheduling, targeted focus blocks, and box breathing sequences. Stress levels decrease drastically, timeline goal achievements climb, and focus completes ahead of exhaustion boundaries."
          },
          scenarioB: {
            title: "Scenario B: Maintain Current Pace",
            completionProbability: 65,
            stressLevel: 55,
            goalSuccessRate: 60,
            narrativeInsight: "Continuing at your current pace is stable. You will complete key responsibilities, but trailing tasks will slowly overflow into evenings, keeping stress at a moderate plateau."
          },
          scenarioC: {
            title: "Scenario C: Increase Intentional Focus by 20%",
            completionProbability: 78,
            stressLevel: 41,
            goalSuccessRate: 75,
            narrativeInsight: "By raising concentration efforts slightly (e.g., locking notifications, adding 15m of daily planning), workloads clear ahead of deadlines. Your stress index drops, and goal success climbs."
          },
          scenarioD: {
            title: "Scenario D: Allow Deadlines to Slip",
            completionProbability: 29,
            stressLevel: 80,
            goalSuccessRate: 18,
            narrativeInsight: "Neglecting planned time boxes causes focus logs to cascade. Missed items escalate cognitive debt, forcing late-night survival sessions. Stress levels spike to critical alerts."
          },
          mindfulCoachAdvice: "Aegis highly advises stepping into Scenario A (Aegis Recommended Workflow). It optimizes your cognitive energy budget, locking completion probabilities at 86% while dropping stress levels to 22%."
        });
        setSimulationLoading(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/api/simulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({ tasks, habits })
      });
      const data = await response.json();

      if (response.ok) {
        setSimulationData(data);
      } else {
        setSimulationError(data.error || "Failed to simulate outcomes.");
      }
    } catch (err) {
      console.error(err);
      setSimulationError("Backend simulation offline. Make sure Express server is running.");
    } finally {
      setSimulationLoading(false);
    }
  };

  const handleExtractInbox = async (e) => {
    e.preventDefault();
    if (!inboxText.trim()) return;

    setInboxLoading(true);
    setInboxError('');
    setInboxResult(null);

    if (isDemoMode) {
      setTimeout(() => {
        const lowerText = inboxText.toLowerCase();
        let title = "Process Pasted Memo Details";
        let priority = "medium";
        let category = "Work";
        let dueDate = formatDateStr(new Date(Date.now() + 86400000));

        if (lowerText.includes("interview") || lowerText.includes("review")) {
          title = "Technical architecture review";
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

        const wordMatch = inboxText.match(/([A-Z][a-z]+)\s+review/);
        if (wordMatch) {
          title = `${wordMatch[1]} Review Preparation`;
        } else if (inboxText.trim().length > 5) {
          title = inboxText.trim().substring(0, 45) + (inboxText.trim().length > 45 ? "..." : "");
        }

        setInboxResult({
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
        });
        setInboxLoading(false);
      }, 500);
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/api/inbox-action', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          text: inboxText,
          currentDate: formatDateStr(new Date())
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to parse inbox text.");
      }

      setInboxResult(data);
    } catch (err) {
      console.error(err);
      setInboxError(err.message || "Failed to parse text. Check backend node server status.");
    } finally {
      setInboxLoading(false);
    }
  };

  // Import parsed inbox task into task database and schedule
  const handleImportInboxTask = () => {
    if (!inboxResult) return;

    const { task: extTask, subtasks: extSubtasks, suggested_schedule } = inboxResult;
    const newTaskId = 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5);

    const newTask = {
      id: newTaskId,
      title: extTask.title,
      priority: extTask.priority,
      category: extTask.category,
      dueDate: extTask.dueDate,
      duration: Math.round(inboxResult.estimated_hours * 60) || 60,
      cognitiveLoad: extTask.cognitiveLoad,
      status: suggested_schedule?.startTime ? 'in_progress' : 'todo',
      subtasks: extSubtasks.map((s, idx) => ({
        id: `sub_${newTaskId}_${idx}`,
        title: s.title,
        completed: false
      }))
    };

    setTasks(prev => [...prev, newTask]);

    if (suggested_schedule?.startTime) {
      const newEvent = {
        id: 'event_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
        taskId: newTaskId,
        title: extTask.title,
        startTime: suggested_schedule.startTime,
        duration: Math.round(inboxResult.estimated_hours * 60) || 60
      };
      setEvents(prev => [...prev, newEvent]);
    }

    setInboxResult(null);
    setInboxText('');
    alert("Focus task imported, calendar scheduled, and subtasks registered successfully!");
  };

  // Trigger Brain Dump Extraction
  const handleProcessBrainDump = async (e) => {
    e.preventDefault();
    if (!brainDumpText.trim()) return;

    setBrainDumpLoading(true);
    setBrainDumpError('');
    setBrainDumpResult(null);

    if (isDemoMode) {
      setTimeout(() => {
        const goals = [];
        const tasks = [];
        const deadlines = [];
        const risks = [];
        const lowerText = brainDumpText.toLowerCase();

        const broadridgeDate = formatDateStr(new Date(Date.now() + 86400000));
        const july2Match = lowerText.includes("july 2") || lowerText.includes("tomorrow");
        const june30Match = lowerText.includes("june 30") || lowerText.includes("friday");

        if (lowerText.includes("integration test") || lowerText.includes("exam") || lowerText.includes("test")) {
          const d = july2Match ? formatDateStr(new Date(Date.now() + 86400000)) : formatDateStr(new Date(Date.now() + 172800000));
          tasks.push({ title: "Revise system integration test concepts", priority: "high", category: "Study", dueDate: d, duration: 180, cognitiveLoad: 5 });
          deadlines.push({ title: "Integration Test Target Date", date: d });
        }

        if (lowerText.includes("deployment") || lowerText.includes("hackathon") || lowerText.includes("publish")) {
          const d = june30Match ? formatDateStr(new Date(Date.now() + 172800000)) : formatDateStr(new Date(Date.now() + 86400000));
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
          tasks.push({ title: brainDumpText.trim().substring(0, 45) + (brainDumpText.trim().length > 45 ? "..." : ""), priority: "medium", category: "Work", dueDate: formatDateStr(new Date(Date.now() + 86400000)), duration: 60, cognitiveLoad: 3 });
        }
        if (goals.length === 0) {
          goals.push({ title: "Align daily schedules with 15 cognitive load points cap", category: "Personal" });
        }

        const estimatedWorkloadHours = tasks.reduce((acc, t) => acc + (t.duration / 60), 0);
        risks.push(estimatedWorkloadHours > 5
          ? "Overlapping focus tasks will create cognitive load spikes. Aegis advises scheduling 1-minute box breathing pauses between study sessions."
          : "Workflow is balanced. Maintain daily streaks."
        );

        setBrainDumpResult({ goals, tasks, deadlines, estimatedWorkloadHours, risks });
        setBrainDumpLoading(false);
      }, 600);
      return;
    }

    try {
      const response = await fetch(API_BASE_URL + '/api/braindump', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-gemini-key': apiKey
        },
        body: JSON.stringify({
          text: brainDumpText,
          currentDate: formatDateStr(new Date())
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to process brain dump.");
      }

      setBrainDumpResult(data);
    } catch (err) {
      console.error(err);
      setBrainDumpError(err.message || "Failed to connect to Brain Dump API. Make sure Node backend is active.");
    } finally {
      setBrainDumpLoading(false);
    }
  };

  // Approve & Save generated tasks/goals/deadlines
  const handleApproveBrainDump = () => {
    if (!brainDumpResult) return;
    const { goals: extGoals, tasks: extTasks, deadlines: extDeadlines } = brainDumpResult;

    const newTasks = extTasks.map((t, idx) => {
      const newTaskId = 'task_bd_' + Date.now() + '_' + idx;
      return {
        id: newTaskId,
        title: t.title,
        priority: t.priority,
        category: t.category,
        dueDate: t.dueDate,
        duration: t.duration || 60,
        cognitiveLoad: t.cognitiveLoad || 3,
        status: 'todo',
        subtasks: []
      };
    });

    const newEvents = extDeadlines.map((d, idx) => {
      return {
        id: 'event_bd_' + Date.now() + '_' + idx,
        taskId: null,
        title: `${d.title}`,
        startTime: `${d.date}T10:00:00`,
        duration: 60
      };
    });

    const newHabits = extGoals.map((g, idx) => {
      return {
        id: 'habit_bd_' + Date.now() + '_' + idx,
        title: g.title,
        streak: 0,
        history: []
      };
    });

    setTasks(prev => [...prev, ...newTasks]);
    setEvents(prev => [...prev, ...newEvents]);
    setHabits(prev => [...prev, ...newHabits]);

    addHistoryLog('plan', `Brain Dump: Extracted ${extTasks.length} task(s), ${extDeadlines.length} deadline(s), and ${extGoals.length} wellness goal(s).`);
    alert(`Accountability confirmed! Integrated ${extTasks.length} task(s), ${extDeadlines.length} calendar deadline(s), and ${extGoals.length} wellness goal(s) successfully!`);

    setBrainDumpResult(null);
    setBrainDumpText('');
  };

  // Voice Coach check-in trigger
  const handleVoiceCoachCheckIn = async () => {
    const todayStr = formatDateStr(new Date());
    const todayTask = tasks.find(t => t.status !== 'completed' && (t.dueDate === todayStr || events.some(e => e.taskId === t.id && e.startTime.startsWith(todayStr))));

    if (!todayTask) {
      const speech = "You have no outstanding focus blocks scheduled for today, traveler. Breathe deep and enjoy your peace.";
      setVoiceCoachMessage(speech);
      setVoiceCoachLogs([{ sender: 'coach', text: speech }]);
      setVoiceCoachStatusText("Flow balanced");
      speakText(speech);
      return;
    }

    setVoiceCoachTask(todayTask);
    const introSpeech = `You scheduled '${todayTask.title}' for today. Did you complete it?`;
    setVoiceCoachMessage(introSpeech);
    setVoiceCoachLogs([{ sender: 'coach', text: introSpeech }]);
    setVoiceCoachStatusText("Aegis speaking...");
    speakText(introSpeech);

    setTimeout(() => {
      startVoiceCoachListening(todayTask);
    }, 2200);
  };

  const startVoiceCoachListening = (activeTask) => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setVoiceCoachStatusText("Speech recognition unsupported");
      return;
    }

    const rec = new SpeechRecognition();
    rec.continuous = false;
    rec.interimResults = false;
    rec.lang = 'en-US';

    rec.onstart = () => {
      setVoiceCoachListening(true);
      setVoiceCoachStatusText("Listening...");
    };

    rec.onend = () => {
      setVoiceCoachListening(false);
    };

    rec.onresult = async (event) => {
      const text = event.results[0][0].transcript;
      setVoiceCoachUserMessage(text);
      setVoiceCoachLogs(prev => [...prev, { sender: 'user', text: text }]);

      setVoiceCoachStatusText("Aegis is processing...");
      try {
        const response = await fetch(API_BASE_URL + '/api/voice-accountability', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-gemini-key': apiKey
          },
          body: JSON.stringify({
            taskTitle: activeTask.title,
            userResponse: text
          })
        });
        const data = await response.json();

        if (response.ok) {
          setVoiceCoachMessage(data.coachSpeech);
          setVoiceCoachLogs(prev => [...prev, { sender: 'coach', text: data.coachSpeech }]);
          speakText(data.coachSpeech);

          if (data.actionTaken === 'complete') {
            setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, status: 'completed' } : t));
            addHistoryLog('reschedule', `Voice Coach: Task '${activeTask.title}' completed.`);
          } else if (data.actionTaken === 'reschedule' && data.rescheduleDate) {
            setTasks(prev => prev.map(t => t.id === activeTask.id ? { ...t, dueDate: data.rescheduleDate, status: 'todo' } : t));

            setEvents(prev => prev.map(e => {
              if (e.taskId === activeTask.id) {
                return { ...e, startTime: `${data.rescheduleDate}T09:30:00` };
              }
              return e;
            }));
            addHistoryLog('reschedule', `Voice Coach: Task '${activeTask.title}' rescheduled to ${data.rescheduleDate}.`);
          }
          setVoiceCoachStatusText(data.mindfulAdvice);
        } else {
          setVoiceCoachStatusText("Connection error");
        }
      } catch (err) {
        console.error(err);
        setVoiceCoachStatusText("Backend offline");
      }
    };

    rec.onerror = (e) => {
      console.error(e);
      setVoiceCoachStatusText("Mic check error");
      setVoiceCoachListening(false);
    };

    rec.start();
  };

  // Progress metrics
  const completedCount = tasks.filter(t => t.status === 'completed').length;
  const totalCount = tasks.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Daily Cognitive Load
  const dailyActiveTasks = tasks.filter(t => t.dueDate === selectedDate && t.status !== 'completed');
  const dailyCognitiveLoad = dailyActiveTasks.reduce((acc, t) => acc + (t.cognitiveLoad || 3), 0);
  const loadPercentage = Math.min(100, Math.round((dailyCognitiveLoad / 15) * 100));

  let loadStatusClass = 'energy-peaceful';
  let loadLabelText = 'Peaceful Flow';
  if (dailyCognitiveLoad > 6 && dailyCognitiveLoad <= 12) {
    loadStatusClass = 'energy-balanced';
    loadLabelText = 'Balanced focus';
  } else if (dailyCognitiveLoad > 12) {
    loadStatusClass = 'energy-overloaded';
    loadLabelText = 'Heavy load (Warning)';
  }

  // Tasks sorting
  const todoTasks = tasks.filter(t => t.status === 'todo');
  const inProgressTasks = tasks.filter(t => t.status === 'in_progress');
  const completedTasks = tasks.filter(t => t.status === 'completed');

  // Filter events for active day
  const selectedDateEvents = events.filter(e => e.startTime.startsWith(selectedDate));
  const CALENDAR_HOURS = Array.from({ length: 15 }, (_, i) => i + 8);

  const renderEnergyDots = (score) => {
    const dotsClass = score >= 5 ? 'active-amber' : score >= 3 ? 'active-purple' : 'active-teal';
    return (
      <div className="energy-dots" title={`Energy Required: ${score}/5`}>
        {Array.from({ length: 5 }, (_, i) => (
          <span
            key={i}
            className={`energy-dot-pip ${i < score ? dotsClass : ''}`}
          />
        ))}
      </div>
    );
  };

  // Burnout category styling helper
  const getBurnoutBadgeStyle = (category) => {
    switch (category) {
      case 'Critical':
        return { color: '#f87171', background: 'rgba(239, 68, 68, 0.15)', borderColor: 'rgba(239, 68, 68, 0.3)' };
      case 'High':
      case 'High Risk':
        return { color: '#fbbf24', background: 'rgba(245, 158, 11, 0.15)', borderColor: 'rgba(245, 158, 11, 0.3)' };
      case 'Moderate':
        return { color: '#c084fc', background: 'rgba(167, 139, 250, 0.15)', borderColor: 'rgba(167, 139, 250, 0.3)' };
      default: // Healthy
        return { color: '#34d399', background: 'rgba(20, 184, 166, 0.15)', borderColor: 'rgba(20, 184, 166, 0.3)' };
    }
  };

  // Determine if a critical deadline is within 48 hours
  const todayStr = formatDateStr(new Date());
  const tomorrowStr = formatDateStr(new Date(Date.now() + 86400000));
  const hasUrgentDeadline = tasks.some(t =>
    t.priority === 'high' &&
    t.status !== 'completed' &&
    (t.dueDate === todayStr || t.dueDate === tomorrowStr)
  );

  // Render metric slider indicator inside the Future Self card deck
  const renderSimulationSlider = (label, value, barColor) => {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '10px 0' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px' }}>
          <span style={{ color: 'var(--text-muted)' }}>{label}</span>
          <span style={{ fontWeight: 'bold', color: '#fff' }}>{value}%</span>
        </div>
        <div style={{ height: '6px', background: 'rgba(255,255,255,0.06)', borderRadius: '3px', overflow: 'hidden' }}>
          <div
            style={{
              height: '100%',
              width: `${value}%`,
              background: barColor,
              borderRadius: '3px',
              transition: 'width 0.6s cubic-bezier(0.16, 1, 0.3, 1)'
            }}
          />
        </div>
      </div>
    );
  };

  // Compile active notifications based on current app state
  const getActiveNotifications = () => {
    const list = [];

    // 1. Urgent Deadline Notification (allows activating survival mode)
    if (hasUrgentDeadline && !survivalModeActive) {
      list.push({
        id: 'urgent_deadline',
        title: 'Urgent Deadline Approaching',
        message: 'You have high-priority tasks due within 48 hours. Activate Survival Mode to maximize focus?',
        type: 'warning',
        actionLabel: 'Activate Survival Mode',
        action: () => setSurvivalModeActive(true)
      });
    }

    // 2. High Burnout Risk Alert
    if (burnoutData && burnoutData.burnoutIndex > 50) {
      list.push({
        id: 'burnout_warning',
        title: 'Burnout Index Alert',
        message: `Biometrics show high burnout risk index (${burnoutData.burnoutIndex}/100). Consider taking a breathing break.`,
        type: 'danger',
        actionLabel: 'Practice Breathing',
        action: () => { setBreathingActive(true); setBreathingTimer(60); }
      });
    }

    // 3. Cognitive Overload Alert
    if (dailyCognitiveLoad > 10) {
      list.push({
        id: 'cognitive_overload',
        title: 'High Cognitive Load',
        message: `Daily workload load is at ${dailyCognitiveLoad}/15 units. Aegis recommends deferring non-essential tasks to prevent exhaustion.`,
        type: 'info'
      });
    }

    // 4. Overdue Rescheduling Recommendation
    if (rescheduleNotification) {
      list.push({
        id: 'overdue_reschedule',
        title: 'Adaptive Rescheduling',
        type: 'warning'
      });
    }

    // 5. Smart Recovery Replan Alert
    if (recoveryData || recoveryLoading) {
      list.push({
        id: 'smart_recovery',
        title: 'Smart Recovery Agent',
        type: 'warning'
      });
    }

    if (isDemoMode) {
      list.push(...DEMO_NOTIFICATIONS);
    }
    return list;
  };

  const activeNotifications = getActiveNotifications();

  return (
    <div className="app-container">
      {/* Onboarding / Landing Screen */}
      {!isOnboarded && (
        <div className="onboarding-overlay" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100vw',
          height: '100vh',
          background: 'radial-gradient(circle at center, #0f172a 0%, #020617 100%)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 9999,
          padding: '24px',
          boxSizing: 'border-box',
          overflowY: 'auto'
        }}>
          <div style={{
            maxWidth: '480px',
            width: '100%',
            background: 'rgba(15, 23, 42, 0.45)',
            backdropFilter: 'blur(32px)',
            border: '1px solid rgba(45, 212, 191, 0.15)',
            borderRadius: '24px',
            padding: '40px 32px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 40px rgba(45, 212, 191, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '30px',
            boxSizing: 'border-box'
          }}>
            {/* Logo Brand */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px' }}>
              <div style={{
                width: '64px',
                height: '64px',
                borderRadius: '20px',
                background: 'linear-gradient(135deg, #2dd4bf 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 0 30px rgba(45, 212, 191, 0.3)'
              }}>
                <Shield style={{ width: '28px', height: '28px', color: '#fff' }} />
              </div>
              <h1 style={{
                fontSize: '32px',
                fontWeight: 800,
                color: '#fff',
                fontFamily: 'var(--font-title)',
                letterSpacing: '1px',
                margin: '12px 0 0 0',
                background: 'linear-gradient(to right, #2dd4bf, #a78bfa)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent'
              }}>AEGIS ZEN</h1>
              <p style={{
                fontSize: '14px',
                color: '#94a3b8',
                fontWeight: 500,
                margin: '4px 0 0 0',
                letterSpacing: '0.5px'
              }}>Your AI Focus Operating System</p>
            </div>

            {/* Checklist */}
            <div style={{
              width: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: '14px',
              textAlign: 'left',
              background: 'rgba(255, 255, 255, 0.015)',
              border: '1px solid rgba(255, 255, 255, 0.04)',
              borderRadius: '16px',
              padding: '20px 24px',
              boxSizing: 'border-box'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check style={{ color: '#2dd4bf', width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>AI Daily Briefing</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check style={{ color: '#2dd4bf', width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>Brain Dump → Action Engine</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check style={{ color: '#2dd4bf', width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>Smart Planner</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check style={{ color: '#2dd4bf', width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>Focus Sessions</span>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <Check style={{ color: '#2dd4bf', width: '18px', height: '18px', flexShrink: 0 }} />
                <span style={{ fontSize: '13px', color: '#e2e8f0', fontWeight: 500 }}>Habit Tracking</span>
              </div>
            </div>

            {/* Actions */}
            <div style={{ width: '100%', display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <button
                onClick={() => {
                  localStorage.setItem('aegis_onboarded', 'true');
                  setIsOnboarded(true);
                  setIsDemoMode(true);
                  loadDemoModeData();
                }}
                className="btn-primary"
                style={{
                  width: '100%',
                  padding: '14px',
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: 700,
                  cursor: 'pointer',
                  border: 'none',
                  background: 'linear-gradient(135deg, #2dd4bf 0%, #0d9488 100%)',
                  boxShadow: '0 0 20px rgba(45, 212, 191, 0.25)',
                  transition: 'all 0.2s',
                  color: '#000'
                }}
              >
                Explore Demo
              </button>
              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>No login required.</span>
            </div>
          </div>
        </div>
      )}
      {/* SVGs definitions */}
      <svg style={{ position: 'absolute', width: 0, height: 0 }}>
        <defs>
          <linearGradient id="purple-gradient" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#2dd4bf" />
            <stop offset="100%" stopColor="#7c3aed" />
          </linearGradient>
        </defs>
      </svg>

      {/* Guided box breathing overlay */}
      {breathingActive && (
        <div className="breathing-overlay">
          <div className="breathing-title">Guided Box Breathing</div>
          <div className="breathing-subtitle">Sync your breaths. Rest your focus. Restore your energy.</div>

          <div className="breathing-bubble-wrapper">
            <div className="breathing-circle-outer" />
            <div className={`breathing-circle ${breathingPhase}`}>
              <span className="breathing-instruction">
                {breathingPhase === 'inhale' && 'Breathe In'}
                {breathingPhase === 'hold1' && 'Hold'}
                {breathingPhase === 'exhale' && 'Breathe Out'}
                {breathingPhase === 'hold2' && 'Hold'}
              </span>
            </div>
          </div>

          <div className="breathing-timer">
            Remaining focus pause: <strong>{breathingTimer} seconds</strong>
          </div>

          <button className="breathing-close-btn" onClick={() => setBreathingActive(false)}>
            Return to Work
          </button>
        </div>
      )}

      {/* Floating Dock Navigation Bar */}
      <nav className="dock">
        <button
          className={`dock-item-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
          onClick={() => setActiveTab('dashboard')}
        >
          <BarChart3 className="dock-item-icon" />
          <span className="dock-item-label">Overview</span>
        </button>
        <button
          className={`dock-item-btn ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckSquare className="dock-item-icon" />
          <span className="dock-item-label">Tasks</span>
        </button>
        <button
          className={`dock-item-btn ${activeTab === 'planner' ? 'active' : ''}`}
          onClick={() => setActiveTab('planner')}
        >
          <Sparkles className="dock-item-icon" />
          <span className="dock-item-label">Planner</span>
        </button>
        <button
          className={`dock-item-btn ${activeTab === 'habits' ? 'active' : ''}`}
          onClick={() => setActiveTab('habits')}
        >
          <Flame className="dock-item-icon" />
          <span className="dock-item-label">Zen Habits</span>
        </button>
        <button
          className={`dock-item-btn ${activeTab === 'settings' ? 'active' : ''}`}
          onClick={() => setActiveTab('settings')}
        >
          <Settings className="dock-item-icon" />
          <span className="dock-item-label">Settings</span>
        </button>
      </nav>

      {/* Floating Action Dock for triggers */}
      <div className="floating-action-dock">
        {/* Floating Chat Trigger button */}
        <button
          className={`floating-chat-trigger ${chatOpen ? 'chat-open' : ''}`}
          onClick={() => setChatOpen(true)}
          title="Open Zen Companion Chat"
        >
          <Bot style={{ width: '24px', height: '24px', flexShrink: 0 }} />
          <span className="trigger-label">Zen Companion</span>
        </button>

        {/* Voice Accountability Coach trigger */}
        <button
          className={`voice-coach-trigger ${voiceCoachOpen ? 'active' : ''}`}
          onClick={() => {
            setVoiceCoachOpen(!voiceCoachOpen);
            if (!voiceCoachOpen) {
              setVoiceCoachLogs([]);
              setVoiceCoachMessage("Welcome. Tap below to start your focus accountability check-in.");
              setVoiceCoachStatusText("Aegis is resting");
              setVoiceCoachTask(null);
            }
          }}
          title="Aegis Voice Accountability Coach"
        >
          <Mic style={{ width: '22px', height: '22px', flexShrink: 0 }} />
          <span className="trigger-label">Voice Coach</span>
        </button>

        {/* What Should I Do Next Trigger Orb */}
        <button
          className="what-next-trigger"
          onClick={() => setNextRecommendationOpen(true)}
          title="What should I do next?"
        >
          <Sparkles style={{ width: '22px', height: '22px', flexShrink: 0 }} />
          <span className="trigger-label">Next Action</span>
        </button>
      </div>

      {/* Next Action Recommendation Modal */}
      {nextRecommendationOpen && (
        <div className="modal-backdrop" onClick={() => setNextRecommendationOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>

            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ fontSize: '16px', fontWeight: 'bold', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Sparkles style={{ width: '18px', color: '#10b981' }} /> Next Action Recommendation
              </h3>
              <button
                onClick={() => setNextRecommendationOpen(false)}
                style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}
              >
                ✕
              </button>
            </div>

            {/* Energy selection bar */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Select Focus Energy Level:</span>
              <div style={{ display: 'flex', gap: '6px' }}>
                {[1, 2, 3, 4, 5].map(lvl => (
                  <button
                    key={lvl}
                    onClick={() => setUserEnergyLevel(lvl)}
                    className="action-btn-pill"
                    style={{
                      flexGrow: 1,
                      padding: '8px 0',
                      fontSize: '12px',
                      borderColor: userEnergyLevel === lvl ? '#10b981' : 'var(--border-subtle)',
                      background: userEnergyLevel === lvl ? 'rgba(16, 185, 129, 0.15)' : 'none',
                      color: userEnergyLevel === lvl ? '#34d399' : 'var(--text-main)',
                      fontWeight: userEnergyLevel === lvl ? 'bold' : 'normal'
                    }}
                  >
                    ⚡ {lvl}
                  </button>
                ))}
              </div>
            </div>

            {nextRecLoading && (
              <div style={{ padding: '30px', textAlign: 'center', color: '#10b981', fontSize: '13px', animation: 'pulse-mic 1s infinite' }}>
                Analyzing task priority and matching cognitive load...
              </div>
            )}

            {nextRecError && (
              <p style={{ fontSize: '12px', color: '#f87171', textAlign: 'center' }}>{nextRecError}</p>
            )}

            {nextRecommendation && !nextRecLoading && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                <div style={{ background: 'rgba(255, 255, 255, 0.015)', border: '1px solid var(--border-subtle)', borderRadius: '16px', padding: '18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#10b981', fontWeight: 'bold', letterSpacing: '0.5px' }}>Top Zen Recommendation</span>
                  <h2 style={{ fontSize: '18px', fontWeight: 800, color: '#fff', fontFamily: 'var(--font-title)' }}>
                    {nextRecommendation.task}
                  </h2>
                  <div style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Clock style={{ width: '12px' }} /> Focus Duration: <strong>{nextRecommendation.estimatedDuration} mins</strong>
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                  <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)' }}>Why this action:</span>
                  {nextRecommendation.reason.map((res, idx) => (
                    <div key={idx} style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', gap: '8px', alignItems: 'center' }}>
                      <span style={{ color: '#10b981' }}>✔</span>
                      <span>{res}</span>
                    </div>
                  ))}
                </div>

                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <button
                    onClick={() => handleStartNextTask(nextRecommendation.task, nextRecommendation.estimatedDuration)}
                    className="btn-primary"
                    style={{ flexGrow: 1, background: 'linear-gradient(135deg, #10b981 0%, #0d9488 100%)', borderColor: '#10b981' }}
                  >
                    Start Focus Block
                  </button>
                  <button
                    onClick={handleFetchNextRecommendation}
                    className="action-btn-pill"
                    style={{ padding: '0 16px' }}
                    title="Regenerate choice"
                  >
                    Regenerate
                  </button>
                </div>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between', gap: '10px', marginTop: '4px', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px' }}>
              <button
                onClick={() => {
                  setNextRecommendationOpen(false);
                  setBreathingActive(true);
                  setBreathingTimer(60);
                }}
                className="action-btn-pill"
                style={{ fontSize: '11px', display: 'flex', alignItems: 'center', gap: '6px' }}
              >
                <Wind style={{ width: '12px' }} /> Practice Breathing instead
              </button>
              <button
                onClick={() => setNextRecommendationOpen(false)}
                className="action-btn-pill"
                style={{ fontSize: '11px', background: 'none' }}
              >
                Close
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Voice Coach overlay panel */}
      {voiceCoachOpen && (
        <div className="voice-panel-overlay">
          <div className="voice-panel-header">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Bot style={{ color: '#a78bfa', width: '18px' }} />
              <span style={{ fontSize: '13px', fontWeight: 'bold', fontFamily: 'var(--font-title)' }}>Voice Accountability</span>
            </div>
            <button
              onClick={() => setVoiceCoachOpen(false)}
              style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '14px' }}
            >
              ✕
            </button>
          </div>

          <div className="voice-panel-body">
            <div style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>
              Status: <strong style={{ color: '#a78bfa' }}>{voiceCoachStatusText}</strong>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '180px', overflowY: 'auto', paddingRight: '4px' }}>
              {voiceCoachLogs.length === 0 ? (
                <div style={{ fontSize: '12px', color: 'var(--text-muted)', textAlign: 'center', padding: '20px 0' }}>
                  Verify task progress with Aegis. Tap 'Start Check-In' to begin.
                </div>
              ) : (
                voiceCoachLogs.map((log, idx) => (
                  <div key={idx} className={`voice-log-bubble ${log.sender}`}>
                    {log.text}
                  </div>
                ))
              )}
            </div>

            {/* Visual Waveform visualizer */}
            <div className="voice-waveform-container">
              <span className={`voice-wave-pip ${voiceCoachListening ? 'listening' : ''}`} />
              <span className={`voice-wave-pip ${voiceCoachListening ? 'listening' : ''}`} />
              <span className={`voice-wave-pip ${voiceCoachListening ? 'listening' : ''}`} />
              <span className={`voice-wave-pip ${voiceCoachListening ? 'listening' : ''}`} />
              <span className={`voice-wave-pip ${voiceCoachListening ? 'listening' : ''}`} />
            </div>

            <div style={{ display: 'flex', gap: '10px' }}>
              <button
                onClick={handleVoiceCoachCheckIn}
                className="btn-primary"
                style={{ flexGrow: 1, background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed', fontSize: '12px' }}
              >
                Start Check-In
              </button>
              {voiceCoachTask && (
                <button
                  onClick={() => startVoiceCoachListening(voiceCoachTask)}
                  className="action-btn-pill"
                  style={{ padding: '0 12px' }}
                  title="Re-listen reply"
                >
                  <Mic style={{ width: '13px' }} />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Main Feature content panel */}
      <main className="main-content">

        {/* Brand logo header */}
        <div className="top-header-brand" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '4px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div className="top-header-brand-icon">
              <Wind className="nav-item-icon" style={{ color: '#fff', width: '16px', height: '16px' }} />
            </div>
            <span className="top-header-brand-text">AEGIS ZEN</span>
            {isDemoMode && (
              <span style={{
                fontSize: '9px',
                textTransform: 'uppercase',
                background: 'rgba(245, 158, 11, 0.15)',
                color: '#fbbf24',
                padding: '3px 8px',
                borderRadius: '6px',
                fontWeight: 'bold',
                letterSpacing: '0.5px',
                border: '1px solid rgba(245, 158, 11, 0.25)',
                cursor: 'pointer'
              }}
              onClick={() => setIsDemoMode(false)}
              title="Click to switch to Real Mode"
              >
                Demo Mode
              </span>
            )}
          </div>

          {/* Profile & Notifications */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '14px', position: 'relative' }}>
            <button
              className="action-btn-pill"
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              style={{
                position: 'relative',
                width: '36px',
                height: '36px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                borderRadius: '50%',
                background: notificationsOpen ? 'rgba(45, 212, 191, 0.12)' : 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                padding: 0,
                cursor: 'pointer',
                color: notificationsOpen ? '#2dd4bf' : 'var(--text-muted)'
              }}
              title="Notifications"
            >
              <Bell style={{ width: '15px', height: '15px' }} />
              {activeNotifications.length > 0 && (
                <span style={{ position: 'absolute', top: '10px', right: '10px', width: '6px', height: '6px', borderRadius: '50%', background: '#ef4444' }} />
              )}
            </button>

            {/* Notifications Dropdown Panel */}
            {notificationsOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '12px',
                width: '340px',
                zIndex: 600,
                background: 'linear-gradient(160deg, rgba(17, 17, 27, 0.98) 0%, rgba(10, 10, 18, 0.98) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.05)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '10px' }}>
                  <h4 style={{ fontSize: '13px', fontWeight: 700, fontFamily: 'var(--font-title)', color: '#fff', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <Bell style={{ width: '14px', color: '#2dd4bf' }} /> Notifications ({activeNotifications.length})
                  </h4>
                  {activeNotifications.length > 0 && (
                    <span style={{ fontSize: '10px', color: '#2dd4bf', fontWeight: 600 }}>Aegis Guardian Active</span>
                  )}
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', maxHeight: '280px', overflowY: 'auto', paddingRight: '2px' }}>
                  {activeNotifications.length === 0 ? (
                    <div style={{ textAlign: 'center', padding: '30px 10px', color: 'var(--text-muted)', fontSize: '12.5px' }}>
                      <CheckCircle2 style={{ width: '24px', height: '24px', color: '#2dd4bf', margin: '0 auto 8px auto', opacity: 0.6 }} />
                      All systems nominal. No alerts.
                    </div>
                  ) : (
                    activeNotifications.map(n => {
                      if (n.id === 'overdue_reschedule') {
                        return (
                          <div key={n.id} style={{
                            padding: '12px',
                            background: 'rgba(245, 158, 11, 0.04)',
                            border: '1px solid rgba(245, 158, 11, 0.2)',
                            borderRadius: '10px',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '6px'
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                              <span style={{
                                width: '6px',
                                height: '6px',
                                borderRadius: '50%',
                                background: '#f59e0b'
                              }} />
                              <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>Adaptive Rescheduling</span>
                            </div>

                            {!rescheduleNotification.recommendations && !rescheduleNotification.loading && (
                              <>
                                <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>
                                  Aegis has detected overdue tasks. Let's adapt calendar with AI.
                                </p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleFetchRescheduleRecommendations();
                                    }}
                                    className="action-btn-pill"
                                    style={{
                                      background: 'rgba(245, 158, 11, 0.15)',
                                      color: '#fbbf24',
                                      border: 'none',
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Recalculate with AI
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRescheduleNotification(null);
                                    }}
                                    className="action-btn-pill"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </>
                            )}

                            {rescheduleNotification.loading && (
                              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#2dd4bf', fontSize: '11px', margin: '4px 0' }}>
                                <Sparkles style={{ width: '12px', height: '12px', animation: 'pulse-mic 1s infinite' }} />
                                <span>Aegis is generating suggestions...</span>
                              </div>
                            )}

                            {rescheduleNotification.error && (
                              <>
                                <p style={{ fontSize: '11px', color: '#f87171', margin: 0 }}>{rescheduleNotification.error}</p>
                                <div style={{ display: 'flex', gap: '8px', marginTop: '4px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRescheduleNotification(null);
                                    }}
                                    className="action-btn-pill"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </>
                            )}

                            {rescheduleNotification.recommendations && (
                              <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                                <div style={{
                                  fontSize: '11px',
                                  color: '#2dd4bf',
                                  background: 'rgba(20, 184, 166, 0.05)',
                                  padding: '8px 10px',
                                  borderRadius: '8px',
                                  border: '1px solid rgba(20, 184, 166, 0.15)',
                                  lineHeight: 1.4
                                }}>
                                  <strong>Suggested Adaptation:</strong> {rescheduleNotification.explanation}
                                </div>
                                <div style={{ display: 'flex', gap: '8px' }}>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      handleApplyReschedule();
                                      setNotificationsOpen(false);
                                    }}
                                    className="action-btn-pill"
                                    style={{
                                      background: 'rgba(20, 184, 166, 0.2)',
                                      color: '#2dd4bf',
                                      border: 'none',
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Apply Adjustment
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      setRescheduleNotification(null);
                                    }}
                                    className="action-btn-pill"
                                    style={{
                                      background: 'none',
                                      border: 'none',
                                      color: 'var(--text-muted)',
                                      fontSize: '11px',
                                      padding: '4px 10px',
                                      cursor: 'pointer'
                                    }}
                                  >
                                    Dismiss
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        );
                      }

                      if (n.id === 'smart_recovery') {
                        return (
                          <SmartRecovery
                            key={n.id}
                            data={recoveryData}
                            loading={recoveryLoading}
                            onApprove={handleApplyRecoveryReplan}
                            onDismiss={() => setRecoveryData(null)}
                            compact={true}
                          />
                        );
                      }

                      return (
                        <div key={n.id} style={{
                          padding: '12px',
                          background: 'rgba(255,255,255,0.01)',
                          border: '1px solid rgba(255,255,255,0.04)',
                          borderRadius: '10px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '6px'
                        }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{
                              width: '6px',
                              height: '6px',
                              borderRadius: '50%',
                              background: n.type === 'danger' ? '#ef4444' : n.type === 'warning' ? '#f59e0b' : '#2dd4bf'
                            }} />
                            <span style={{ fontSize: '12px', fontWeight: 700, color: '#fff' }}>{n.title}</span>
                          </div>
                          <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.45 }}>{n.message}</p>
                          {n.action && (
                            <button
                              onClick={() => {
                                n.action();
                                setNotificationsOpen(false);
                              }}
                              className="action-btn-pill"
                              style={{
                                alignSelf: 'flex-start',
                                marginTop: '4px',
                                background: n.type === 'danger' ? 'rgba(239, 68, 68, 0.15)' : n.type === 'warning' ? 'rgba(245, 158, 11, 0.15)' : 'rgba(20, 184, 166, 0.15)',
                                color: n.type === 'danger' ? '#f87171' : n.type === 'warning' ? '#fbbf24' : '#2dd4bf',
                                border: 'none',
                                fontSize: '11px',
                                padding: '4px 10px',
                                cursor: 'pointer'
                              }}
                            >
                              {n.actionLabel}
                            </button>
                          )}
                        </div>
                      );
                    })
                  )}
                </div>
              </div>
            )}

            <div
              onClick={() => setProfileOpen(!profileOpen)}
              style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
              title="Profile Settings"
            >
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: profileOpen ? 'rgba(45, 212, 191, 0.15)' : 'linear-gradient(135deg, #2dd4bf 0%, #7c3aed 100%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border: profileOpen ? '2px solid #2dd4bf' : '1px solid rgba(255,255,255,0.1)',
                transition: 'all 0.25s'
              }}>
                <User style={{ width: '15px', height: '15px', color: '#fff' }} />
              </div>
            </div>

            {/* Profile Dropdown Panel */}
            {profileOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '12px',
                width: '320px',
                zIndex: 600,
                background: 'linear-gradient(160deg, rgba(17, 17, 27, 0.98) 0%, rgba(10, 10, 18, 0.98) 100%)',
                backdropFilter: 'blur(24px)',
                border: '1px solid rgba(255, 255, 255, 0.08)',
                borderRadius: '16px',
                boxShadow: '0 20px 50px rgba(0, 0, 0, 0.6), 0 0 30px rgba(124, 58, 237, 0.05)',
                padding: '16px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px'
              }}>
                {/* Profile header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', borderBottom: '1px solid rgba(255,255,255,0.06)', paddingBottom: '12px' }}>
                  <div style={{ width: '40px', height: '40px', borderRadius: '50%', background: 'linear-gradient(135deg, #2dd4bf 0%, #7c3aed 100%)', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(255,255,255,0.1)' }}>
                    <User style={{ width: '16px', height: '16px', color: '#fff' }} />
                  </div>
                  <div style={{ flexGrow: 1 }}>
                    {isDemoMode ? (
                      <>
                        <h4 style={{ fontSize: '13px', fontWeight: 700, color: '#fff', margin: 0 }}>{username}</h4>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>demo@aegis.zen</span>
                      </>
                    ) : (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                        <input
                          type="text"
                          value={username}
                          onChange={(e) => handleUsernameChange(e.target.value)}
                          className="input-glass"
                          style={{ fontSize: '12px', padding: '4px 8px', width: '100%', border: '1px solid rgba(255,255,255,0.1)', background: 'rgba(0,0,0,0.2)', color: '#fff', borderRadius: '6px' }}
                          placeholder="Your Name..."
                        />
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>user@aegis.zen</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Focus metrics summary */}
                <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.04)', borderRadius: '10px', padding: '10px 12px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Streak Status:</span>
                    <strong style={{ fontSize: '11px', color: '#2dd4bf' }}>4 Days Active</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Focus Rating:</span>
                    <strong style={{ fontSize: '11px', color: '#a78bfa' }}>Excellent (Zen)</strong>
                  </div>
                </div>

                {/* About Us */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#2dd4bf', fontWeight: 700 }}>About Aegis Guardian</span>
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', margin: 0, lineHeight: 1.5 }}>
                    Aegis Zen is an AI-powered productivity sanctuary designed to protect cognitive bandwidth, automate recovery replanning, and prevent burnout.
                  </p>
                </div>

                {/* More Settings Toggles */}
                <div style={{ borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Voice Coach Tone</span>
                    <select
                      value={coachTone}
                      onChange={(e) => setCoachTone(e.target.value)}
                      style={{ background: '#11111b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      <option value="guardian">Guardian (Strict)</option>
                      <option value="zen">Zen Master (Calm)</option>
                      <option value="coach">High Energy Coach</option>
                    </select>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>Ambient Sound</span>
                    <select
                      value={ambientSoundType}
                      onChange={(e) => setAmbientSoundType(e.target.value)}
                      style={{ background: '#11111b', color: '#fff', border: '1px solid rgba(255,255,255,0.1)', borderRadius: '6px', padding: '2px 6px', fontSize: '11px', cursor: 'pointer' }}
                    >
                      <option value="ocean">Ocean Waves</option>
                      <option value="rain">Rain Forest</option>
                      <option value="silent">Silent White Noise</option>
                    </select>
                  </div>
                </div>

                {/* Mobile/Desktop Quick Triggers Section */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', borderTop: '1px solid rgba(255,255,255,0.06)', paddingTop: '10px' }}>
                  <span style={{ fontSize: '10px', textTransform: 'uppercase', letterSpacing: '0.5px', color: '#a78bfa', fontWeight: 700 }}>Aegis Quick Actions</span>
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <button
                      onClick={() => { setChatOpen(true); setProfileOpen(false); }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(45, 212, 191, 0.1)', border: '1px solid rgba(45, 212, 191, 0.2)', borderRadius: '8px', color: '#2dd4bf', fontSize: '11px', cursor: 'pointer' }}
                    >
                      <Bot style={{ width: '14px', height: '14px' }} /> Chat
                    </button>
                    <button
                      onClick={() => {
                        setVoiceCoachOpen(true);
                        setProfileOpen(false);
                        setVoiceCoachLogs([]);
                        setVoiceCoachMessage("Welcome. Tap below to start your focus accountability check-in.");
                        setVoiceCoachStatusText("Aegis is resting");
                        setVoiceCoachTask(null);
                      }}
                      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', padding: '8px', background: 'rgba(167, 139, 250, 0.1)', border: '1px solid rgba(167, 139, 250, 0.2)', borderRadius: '8px', color: '#a78bfa', fontSize: '11px', cursor: 'pointer' }}
                    >
                      <Mic style={{ width: '14px', height: '14px' }} /> Voice
                    </button>
                  </div>
                  <button
                    onClick={() => { setNextRecommendationOpen(true); setProfileOpen(false); }}
                    style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px', width: '100%', padding: '8px', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.1) 0%, rgba(13, 148, 136, 0.1) 100%)', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '8px', color: '#2dd4bf', fontSize: '11px', cursor: 'pointer' }}
                  >
                    <Sparkles style={{ width: '14px', height: '14px' }} /> What should I do next?
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {activeTab === 'dashboard' && (
          <>
            <header className="view-header">
              <div className="view-title-wrap">
                <h1>Overview</h1>
                <p>Let's find your focus rhythm today.</p>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  className={`action-btn-pill ${ambientActive ? 'active' : ''}`}
                  onClick={() => setAmbientActive(!ambientActive)}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    borderColor: ambientActive ? '#14b8a6' : 'rgba(255, 255, 255, 0.08)',
                    color: ambientActive ? '#2dd4bf' : 'var(--text-muted)'
                  }}
                  title="Web Audio Ocean wave noise generator"
                >
                  <Wind style={{ width: '13px' }} />
                  {ambientActive ? 'Waves: ON' : 'Play Ocean Waves'}
                </button>
                <button
                  onClick={() => { setBreathingActive(true); setBreathingTimer(60); }}
                  className="action-btn-pill"
                  style={{ display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <Wind style={{ width: '13px' }} /> Practice Breathing
                </button>
              </div>
            </header>

            {/* Unified Desktop Columns Grid */}
            <div className="overview-row-split">

              {/* Left Column: Daily Briefing + Brain Dump */}
              <div className="overview-split-left">

                {/* 1. Daily Briefing */}
                <DailyBriefing
                  data={briefingData}
                  loading={briefingLoading}
                  onBeginAction={handleStartNextTask}
                />

                {/* 2. Brain Dump */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', height: '100%', margin: 0 }}>
                  <div className="dashboard-panel-header" style={{ marginBottom: '12px' }}>
                    <div>
                      <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles style={{ width: '20px', color: '#2dd4bf' }} /> Brain Dump → Action Engine
                      </h2>
                      <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                        Paste unorganized messages, dates, goals, or notes. Aegis will parse, structure, and preview your schedule workload.
                      </p>
                    </div>
                  </div>

                  <form onSubmit={handleProcessBrainDump} style={{ display: 'flex', flexDirection: 'column', gap: '10px', flexGrow: 1 }}>
                    <textarea
                      placeholder="Paste raw text here (e.g. 'I have a system integration test tomorrow. Project deployment is due by end of the week. Need to prepare for architecture review.')"
                      value={brainDumpText}
                      onChange={(e) => setBrainDumpText(e.target.value)}
                      className="input-glass"
                      style={{ width: '100%', flexGrow: 1, minHeight: '170px', resize: 'none', fontFamily: 'inherit', fontSize: '12px', lineHeight: 1.4 }}
                    />

                    {brainDumpLoading && <div style={{ fontSize: '12px', color: '#2dd4bf', animation: 'pulse-mic 1s infinite' }}>Aegis is organizing your weekly timeline...</div>}
                    {brainDumpError && <div style={{ fontSize: '12px', color: '#f87171' }}>Extraction failed: {brainDumpError}</div>}

                    {!brainDumpResult && !brainDumpLoading && (
                      <button type="submit" className="btn-primary" style={{ alignSelf: 'flex-start' }}>
                        <Sparkles style={{ width: '14px' }} /> Extract Workload
                      </button>
                    )}
                  </form>

                  {brainDumpResult && !brainDumpLoading && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '16px' }}>

                      {/* Risks Alerts */}
                      {brainDumpResult.risks.map((risk, idx) => (
                        <div key={idx} style={{ display: 'flex', gap: '8px', alignItems: 'center', padding: '10px 14px', background: 'rgba(245, 158, 11, 0.03)', border: '1px solid rgba(245, 158, 11, 0.15)', borderRadius: '8px', color: '#fbbf24', fontSize: '12px' }}>
                          <AlertCircle style={{ width: '14px', flexShrink: 0 }} />
                          <span>{risk}</span>
                        </div>
                      ))}

                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>

                        {/* Tasks extracted preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Actionable Tasks ({brainDumpResult.tasks.length})</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {brainDumpResult.tasks.map((t, idx) => (
                              <div key={idx} style={{ fontSize: '12px', display: 'flex', flexDirection: 'column', padding: '8px', background: 'rgba(255,255,255,0.015)', border: '1px solid var(--border-subtle)', borderRadius: '6px' }}>
                                <span style={{ fontWeight: 600 }}>{t.title}</span>
                                <span style={{ fontSize: '10px', color: 'var(--text-muted)', marginTop: '2px' }}>Due: {t.dueDate} | Load: {t.cognitiveLoad}/5 | {t.duration}m</span>
                              </div>
                            ))}
                          </div>
                        </div>

                        {/* Goals extracted preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Wellness Goals ({brainDumpResult.goals.length})</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {brainDumpResult.goals.length === 0 ? (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>No goals extracted.</div>
                            ) : (
                              brainDumpResult.goals.map((g, idx) => (
                                <div key={idx} style={{ fontSize: '12px', padding: '8px', background: 'rgba(20, 184, 166, 0.02)', border: '1px solid rgba(20,184,166,0.15)', borderRadius: '6px', color: '#2dd4bf' }}>
                                  <span>{g.title}</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                        {/* Deadlines extracted preview */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                          <span style={{ fontSize: '11px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Target Deadlines ({brainDumpResult.deadlines.length})</span>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                            {brainDumpResult.deadlines.length === 0 ? (
                              <div style={{ fontSize: '11px', color: 'var(--text-muted-dark)' }}>No deadlines extracted.</div>
                            ) : (
                              brainDumpResult.deadlines.map((d, idx) => (
                                <div key={idx} style={{ fontSize: '12px', padding: '8px', background: 'rgba(239, 68, 68, 0.02)', border: '1px solid rgba(239,68,68,0.15)', borderRadius: '6px', color: '#f87171' }}>
                                  <span>{d.title} ({d.date})</span>
                                </div>
                              ))
                            )}
                          </div>
                        </div>

                      </div>

                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '8px' }}>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Estimated Week Effort: <strong>{brainDumpResult.estimatedWorkloadHours.toFixed(1)} focus hours</strong></span>
                        <div style={{ display: 'flex', gap: '8px' }}>
                          <button onClick={() => setBrainDumpResult(null)} className="action-btn-pill" style={{ background: 'none' }}>
                            Cancel
                          </button>
                          <button onClick={handleApproveBrainDump} className="btn-primary" style={{ background: 'linear-gradient(135deg, #14b8a6 0%, #0d9488 100%)', borderColor: '#14b8a6' }}>
                            <Check style={{ width: '13px' }} /> Approve & Schedule Week
                          </button>
                        </div>
                      </div>

                    </div>
                  )}
                </div>

                {/* 3. Cognitive Load Diagnostic panel */}
                <CognitiveLoad
                  data={cognitiveLoadData}
                  loading={cogLoadLoading}
                />



              </div>

              {/* Right Column: Flow Balance Dashboard, Today's Focus, Burnout, Cognitive Load, AI Insights */}
              <div className="overview-split-right">

                {/* 1. Flow Balance Dashboard */}
                <div className="glass-panel gamified-card" style={{ height: 'auto', margin: 0 }}>
                  <div className="gamified-text" style={{ flexGrow: 1 }}>
                    <h3>
                      <Bot style={{ width: '20px', color: '#2dd4bf' }} />
                      Flow Balance
                    </h3>
                    <p style={{ maxWidth: '320px', fontSize: '12px' }}>
                      Aegis limits daily focus load to <strong>15 energy units</strong>.
                    </p>

                    <div className="energy-budget-container">
                      <div className="energy-bar-label">
                        <span>Cognitive Budget</span>
                        <span>{dailyCognitiveLoad} / 15 Units ({loadLabelText})</span>
                      </div>
                      <div className="energy-bar-track">
                        <div
                          className={`energy-bar-fill ${loadStatusClass}`}
                          style={{ width: `${loadPercentage}%` }}
                        />
                      </div>
                    </div>

                    <div style={{ display: 'flex', gap: '14px', marginTop: '16px', flexWrap: 'wrap' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame style={{ color: 'var(--accent-teal)', width: '18px' }} />
                        <span style={{ fontSize: '13px' }}>Streak: <strong>4 days</strong></span>
                      </div>
                      <button
                        onClick={handleAutoSchedule}
                        className="action-btn-pill"
                        style={{ padding: '4px 12px', fontSize: '11px' }}
                      >
                        Distribute
                      </button>
                    </div>
                  </div>

                  <div className="progress-circle-wrap">
                    <svg className="progress-circle-svg">
                      <circle className="circle-bg" cx="45" cy="45" r="38" />
                      <circle
                        className="circle-progress"
                        cx="45"
                        cy="45"
                        r="38"
                        strokeDasharray="238.76"
                        style={{ stroke: 'url(#purple-gradient)' }}
                        strokeDashoffset={238.76 - (238.76 * completionPercentage) / 100}
                      />
                    </svg>
                    <div className="progress-text">{completionPercentage}%</div>
                  </div>
                </div>

                {/* 2. Today's Focus (Active Today tasks list) */}
                <div className="glass-panel" style={{ padding: '24px', margin: 0 }}>
                  <div className="dashboard-panel-header">
                    <h2>Today's Focus</h2>
                    <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Active Scheduled Tasks</span>
                  </div>
                  <div className="urgent-tasks-list">
                    {tasks.filter(t => t.dueDate === formatDateStr(new Date()) && t.status !== 'completed' && (!survivalModeActive || t.priority === 'high')).length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0' }}>
                        <CheckCircle2 style={{ margin: '0 auto 8px auto', color: '#14b8a6', width: '28px', height: '28px' }} />
                        <p style={{ fontSize: '13px' }}>No active tasks. Breathe deep.</p>
                      </div>
                    ) : (
                      tasks.filter(t => t.dueDate === formatDateStr(new Date()) && t.status !== 'completed' && (!survivalModeActive || t.priority === 'high')).map(task => (
                        <div key={task.id} className="urgent-task-item" style={{ padding: '8px 10px' }}>
                          {renderEnergyDots(task.cognitiveLoad || 3)}
                          <span className="urgent-task-title">{task.title}</span>
                          <div className="urgent-task-meta">
                            <span>{task.category}</span>
                            <span><Clock style={{ width: '11px' }} />{task.duration}m</span>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* 3. Burnout Predictor card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.04) 0%, rgba(139, 92, 246, 0.02) 100%)', borderColor: 'rgba(239, 68, 68, 0.15)', margin: 0 }}>
                  <div className="dashboard-panel-header" style={{ marginBottom: '8px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#f87171' }}>
                      <Flame style={{ width: '16px' }} /> Burnout Predictor
                    </h3>
                  </div>

                  {burnoutLoading && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Analyzing signals...</div>}
                  {burnoutError && <div style={{ fontSize: '12px', color: '#f87171' }}>Index error: {burnoutError}</div>}

                  {burnoutData && !burnoutLoading && (
                    <>
                      <div style={{ display: 'flex', alignItems: 'baseline', gap: '8px', margin: '8px 0' }}>
                        <span style={{ fontSize: '36px', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff' }}>
                          {burnoutData.burnoutScore}
                        </span>
                        <span style={{ fontSize: '12px', color: 'var(--text-muted)' }}>/ 100</span>
                        <span
                          style={{
                            fontSize: '11px',
                            fontWeight: 'bold',
                            padding: '3px 8px',
                            borderRadius: '6px',
                            border: '1px solid',
                            marginLeft: 'auto',
                            ...getBurnoutBadgeStyle(burnoutData.category)
                          }}
                        >
                          {burnoutData.category}
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: '12px', color: 'var(--text-muted)', marginBottom: '14px' }}>
                        <div>{burnoutData.metricsSummary.workloadChange}</div>
                        <div>{burnoutData.metricsSummary.cognitiveStress}</div>
                      </div>

                      {/* Workload Stress Trend Bar Chart */}
                      <div style={{ borderTop: '1px solid var(--border-subtle)', paddingTop: '14px', marginTop: '4px' }}>
                        <span style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 'bold', textTransform: 'uppercase', display: 'block', marginBottom: '10px' }}>Weekly Stress Assessment</span>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', height: '110px', padding: '5px 0' }}>
                          {burnoutData.trendData.map((d, i) => (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1, gap: '6px' }}>
                              <div
                                style={{
                                  width: '16px',
                                  height: `${Math.max(6, d.score * 1.1)}px`,
                                  background: d.score > 80 ? 'linear-gradient(180deg, #ef4444 0%, #b91c1c 100%)' :
                                    d.score > 60 ? 'linear-gradient(180deg, #f59e0b 0%, #b45309 100%)' :
                                      d.score > 30 ? 'linear-gradient(180deg, #a78bfa 0%, #7c3aed 100%)' :
                                        'linear-gradient(180deg, #2dd4bf 0%, #0d9488 100%)',
                                  borderRadius: '3px',
                                  boxShadow: d.score > 60 ? '0 0 6px rgba(245,158,11,0.15)' : 'none',
                                  transition: 'height 0.4s ease'
                                }}
                                title={`Score: ${d.score}`}
                              />
                              <span style={{ fontSize: '9px', color: 'var(--text-muted)' }}>{d.day}</span>
                            </div>
                          ))}
                        </div>
                      </div>
                    </>
                  )}

                  {!burnoutData && !burnoutLoading && !burnoutError && (
                    <div style={{ color: 'var(--text-muted)', fontSize: '12px', textAlign: 'center', padding: '16px 0' }}>
                      No burnout index available. Add tasks to predict risk.
                    </div>
                  )}
                </div>

                {/* 4. Focus & Streak Status card */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.03) 0%, rgba(139, 92, 246, 0.03) 100%)', borderColor: 'rgba(20, 184, 166, 0.12)', margin: 0 }}>
                  <div className="dashboard-panel-header" style={{ marginBottom: '12px' }}>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)' }}>
                      <Award style={{ width: '16px', color: 'var(--accent-teal)' }} /> Focus & Streak Status
                    </h3>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '4px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Flame style={{ width: '16px', color: '#f59e0b' }} /> Streak Status
                      </span>
                      <strong style={{ fontSize: '13px', color: '#2dd4bf' }}>4 Days Active</strong>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', borderRadius: '10px', padding: '12px 14px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <Sparkles style={{ width: '16px', color: '#a78bfa' }} /> Focus Rating
                      </span>
                      <strong style={{ fontSize: '13px', color: '#a78bfa' }}>Excellent (Zen)</strong>
                    </div>
                  </div>
                </div>







                {/* 7. DEADLINE SURVIVAL MODE ACTION BANNER */}
                {survivalModeActive && (
                  <div className="glass-panel" style={{ padding: '24px', background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(245, 158, 11, 0.04) 100%)', borderColor: '#f87171', margin: 0, position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: '16px', right: '20px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ef4444', animation: 'pulse-mic 1s infinite' }} />
                      <span style={{ fontSize: '10px', fontWeight: 'bold', color: '#f87171', letterSpacing: '1px' }}>SURVIVAL</span>
                    </div>

                    <h2 style={{ fontSize: '16px', fontWeight: 'bold', color: '#f87171', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <AlertCircle style={{ width: '18px' }} /> Survival Mode Active
                    </h2>
                    <p style={{ fontSize: '12px', color: 'var(--text-muted)', marginBottom: '16px', lineHeight: 1.4 }}>
                      Task list is filtered. Wellness habits temporarily locked to optimize urgency response velocity.
                    </p>

                    {survivalLoading && <div style={{ fontSize: '12px', color: 'var(--text-muted)' }}>Calculating survival statistics...</div>}

                    {survivalData && !survivalLoading && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', borderTop: '1px solid var(--border-subtle)', paddingTop: '12px' }}>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Remaining Work:</span>
                          <strong style={{ fontSize: '15px', color: '#fff', marginLeft: '6px' }}>{(survivalData.remainingWorkMinutes / 60).toFixed(1)} hrs</strong>
                        </div>
                        <div>
                          <span style={{ fontSize: '10px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Probability:</span>
                          <strong style={{ fontSize: '15px', color: '#34d399', marginLeft: '6px' }}>{survivalData.completionProbability}%</strong>
                        </div>
                      </div>
                    )}

                    <div style={{ display: 'flex', gap: '8px', marginTop: '16px' }}>
                      <button className="action-btn-pill" onClick={() => setSurvivalModeActive(false)} style={{ background: 'rgba(255,255,255,0.06)' }}>
                        Disable
                      </button>
                      <button className="action-btn-pill" onClick={() => setActiveTab('planner')} style={{ background: '#ef4444', color: '#fff', borderColor: '#ef4444' }}>
                        Compress
                      </button>
                    </div>
                  </div>
                )}

              </div>
            </div>

            {/* Row 4: Future Self Simulator (Full Box Row) */}
            <div className="glass-panel" style={{ padding: '24px', marginTop: '8px' }}>
              <div className="dashboard-panel-header" style={{ marginBottom: '12px' }}>
                <div>
                  <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700 }}>
                    <Sparkles style={{ width: '18px', color: '#a78bfa' }} /> Future Self Simulator
                  </h2>
                  <p style={{ fontSize: '13px', color: 'var(--text-muted)', marginTop: '4px' }}>
                    Model task completion densities, goal histories, and streaks to project long-term payoffs.
                  </p>
                </div>

                <button
                  className="btn-primary"
                  onClick={handlePredictSimulation}
                  disabled={simulationLoading}
                  style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed', padding: '8px 16px', fontSize: '12px' }}
                >
                  <Clock style={{ width: '14px' }} /> {simulationLoading ? "Simulating..." : "Predict Outcome"}
                </button>
              </div>

              {simulationLoading && (
                <div style={{ padding: '30px', textAlign: 'center', color: '#a78bfa', fontSize: '13px', animation: 'pulse-mic 1s infinite' }}>
                  Aegis is generating alternate future timelines...
                </div>
              )}

              {simulationError && (
                <div style={{ padding: '14px', color: '#f87171', fontSize: '12px', textAlign: 'center' }}>
                  {simulationError}
                </div>
              )}

              {simulationData && !simulationLoading && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', marginTop: '16px', borderTop: '1px solid var(--border-subtle)', paddingTop: '20px' }}>

                  <div style={{ padding: '14px 18px', background: 'rgba(167, 139, 250, 0.05)', border: '1px solid rgba(167, 139, 250, 0.15)', borderRadius: '12px', fontSize: '13px', color: '#a78bfa', lineHeight: 1.5 }}>
                    <strong>Aegis Simulation Summary:</strong> {simulationData.mindfulCoachAdvice}
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '16px' }}>
                    {simulationData.scenarioA && (
                      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(20, 184, 166, 0.02)', borderColor: 'rgba(20, 184, 166, 0.3)' }}>
                        <h4 style={{ color: '#2dd4bf', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Sparkles style={{ width: '14px', height: '14px' }} /> {simulationData.scenarioA.title}
                        </h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '65px', marginBottom: '16px' }}>
                          {simulationData.scenarioA.narrativeInsight}
                        </p>
                        {renderSimulationSlider("Completion Probability", simulationData.scenarioA.completionProbability, "#2dd4bf")}
                        {renderSimulationSlider("Stress Index", simulationData.scenarioA.stressLevel, "#ef4444")}
                        {renderSimulationSlider("Goal Success", simulationData.scenarioA.goalSuccessRate, "#a78bfa")}
                      </div>
                    )}

                    {simulationData.scenarioB && (
                      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(255,255,255,0.015)' }}>
                        <h4 style={{ color: '#38bdf8', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>{simulationData.scenarioB.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '65px', marginBottom: '16px' }}>
                          {simulationData.scenarioB.narrativeInsight}
                        </p>
                        {renderSimulationSlider("Completion Probability", simulationData.scenarioB.completionProbability, "#2dd4bf")}
                        {renderSimulationSlider("Stress Index", simulationData.scenarioB.stressLevel, "#ef4444")}
                        {renderSimulationSlider("Goal Success", simulationData.scenarioB.goalSuccessRate, "#a78bfa")}
                      </div>
                    )}

                    {simulationData.scenarioC && (
                      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(167, 139, 250, 0.02)', borderColor: 'rgba(167, 139, 250, 0.25)' }}>
                        <h4 style={{ color: '#a78bfa', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>{simulationData.scenarioC.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '65px', marginBottom: '16px' }}>
                          {simulationData.scenarioC.narrativeInsight}
                        </p>
                        {renderSimulationSlider("Completion Probability", simulationData.scenarioC.completionProbability, "#2dd4bf")}
                        {renderSimulationSlider("Stress Index", simulationData.scenarioC.stressLevel, "#ef4444")}
                        {renderSimulationSlider("Goal Success", simulationData.scenarioC.goalSuccessRate, "#a78bfa")}
                      </div>
                    )}

                    {simulationData.scenarioD && (
                      <div className="glass-panel" style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.01)', borderColor: 'rgba(239, 68, 68, 0.2)' }}>
                        <h4 style={{ color: '#f87171', fontWeight: 'bold', fontSize: '14px', marginBottom: '10px' }}>{simulationData.scenarioD.title}</h4>
                        <p style={{ fontSize: '12px', color: 'var(--text-muted)', lineHeight: 1.45, minHeight: '65px', marginBottom: '16px' }}>
                          {simulationData.scenarioD.narrativeInsight}
                        </p>
                        {renderSimulationSlider("Completion Probability", simulationData.scenarioD.completionProbability, "#2dd4bf")}
                        {renderSimulationSlider("Stress Index", simulationData.scenarioD.stressLevel, "#ef4444")}
                        {renderSimulationSlider("Goal Success", simulationData.scenarioD.goalSuccessRate, "#a78bfa")}
                      </div>
                    )}

                  </div>
                </div>
              )}
            </div>

            {/* Row 5: Timeline Summary (Full Box Row) */}
            <div className="glass-panel" style={{ padding: '24px', marginTop: '8px' }}>
              <div className="dashboard-panel-header" style={{ marginBottom: '12px' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '16px', fontWeight: 700 }}>
                  <CalendarIcon style={{ width: '18px', color: 'var(--accent-teal)' }} /> Timeline Summary
                </h2>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {selectedDateEvents.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '40px 10px' }}>
                    <p style={{ fontSize: '13px', margin: 0 }}>Your timeline is currently clear. Use Aegis or click 'Distribute Schedule' to arrange events.</p>
                  </div>
                ) : (
                  selectedDateEvents.map(event => {
                    const timeStr = event.startTime.split('T')[1].substring(0, 5);
                    return (
                      <div key={event.id} style={{ display: 'flex', gap: '12px', alignItems: 'center', padding: '10px 12px', background: 'rgba(255,255,255,0.015)', borderRadius: '8px', border: '1px solid rgba(255,255,255,0.03)' }}>
                        <span style={{ fontSize: '11px', color: 'var(--accent-teal)', fontWeight: 'bold' }}>{timeStr}</span>
                        <span style={{ fontSize: '13px', fontWeight: 500, lineHeight: '1.4', color: 'var(--text-main)' }}>{event.title}</span>
                      </div>
                    );
                  })
                )}
              </div>
            </div>


          </>
        )}

        {activeTab === 'tasks' && (
          <>
            <header className="view-header">
              <div className="view-title-wrap">
                <h1>Task Manager</h1>
                <p>Note down items. Aegis uses cognitive scores to balance scheduling weights.</p>
              </div>
              {survivalModeActive && (
                <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                  SURVIVAL FILTER ACTIVE (Low priority hidden)
                </div>
              )}
            </header>

            {/* Quick Add Forms Grid */}
            <div className="dashboard-grid" style={{ gap: '20px', marginBottom: '24px' }}>

              {/* Left Column: Manual Form */}
              <div className="glass-panel" style={{ padding: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#2dd4bf' }}>Manual Task Entry</h3>
                <form onSubmit={handleCreateTaskManually} style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <input
                    type="text"
                    placeholder="Task title (e.g. 'Learn React Hooks')..."
                    value={newTaskTitle}
                    onChange={(e) => setNewTaskTitle(e.target.value)}
                    className="input-glass"
                    style={{ width: '100%' }}
                  />
                  <input
                    type="text"
                    placeholder="Task description (optional)..."
                    value={newTaskDescription}
                    onChange={(e) => setNewTaskDescription(e.target.value)}
                    className="input-glass"
                    style={{ width: '100%' }}
                  />
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                    <select
                      value={newTaskPriority}
                      onChange={(e) => setNewTaskPriority(e.target.value)}
                      className="select-glass"
                    >
                      <option value="high">High Priority</option>
                      <option value="medium">Medium Priority</option>
                      <option value="low">Low/Easy Flow</option>
                    </select>
                    <select
                      value={newTaskCategory}
                      onChange={(e) => setNewTaskCategory(e.target.value)}
                      className="select-glass"
                    >
                      <option value="Work">Work</option>
                      <option value="Study">Study</option>
                      <option value="Personal">Personal</option>
                      <option value="Health">Health</option>
                      <option value="Finance">Finance</option>
                    </select>
                  </div>

                  {isEstimating && (
                    <div style={{ fontSize: '11px', color: '#2dd4bf', padding: '4px', animation: 'pulse-mic 1.5s infinite' }}>
                      Aegis is estimating effort and duration...
                    </div>
                  )}

                  {!isEstimating && estimatedMinutes > 0 && (
                    <div style={{ fontSize: '12px', background: 'rgba(20, 184, 166, 0.04)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '8px', padding: '10px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                      <div style={{ fontWeight: 600, color: '#fff' }}>
                        Estimated: {estimatedMinutes >= 60 ? `${(estimatedMinutes / 60).toFixed(1)} hours` : `${estimatedMinutes} mins`}
                      </div>
                      <div style={{ fontSize: '10px', color: 'var(--text-muted)' }}>
                        Complexity: <strong style={{ color: '#a78bfa' }}>{estimatedComplexity}</strong> | Focus load: <strong style={{ color: '#2dd4bf' }}>{estimatedCognitiveLoad}/5</strong> (Confidence: {estimatedConfidence}%)
                      </div>
                      <label style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: 'var(--text-muted)', cursor: 'pointer', marginTop: '6px', userSelect: 'none' }}>
                        <input
                          type="checkbox"
                          checked={overrideEstimation}
                          onChange={(e) => setOverrideEstimation(e.target.checked)}
                          style={{ width: '12px', height: '12px', accentColor: 'var(--accent-teal)' }}
                        />
                        <span>Override estimation recommendations</span>
                      </label>
                    </div>
                  )}

                  {/* Manual entry overrides displayed only if selected or if no active estimation yet */}
                  {(overrideEstimation || estimatedMinutes === 0) && (
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                      <select
                        value={newTaskCognitiveLoad}
                        onChange={(e) => setNewTaskCognitiveLoad(Number(e.target.value))}
                        className="select-glass"
                        title="Cognitive load"
                      >
                        <option value="1">Load: Easy (1/5)</option>
                        <option value="2">Load: Mild (2/5)</option>
                        <option value="3">Load: Moderate (3/5)</option>
                        <option value="4">Load: Deep (4/5)</option>
                        <option value="5">Load: Intense (5/5)</option>
                      </select>
                      <input
                        type="number"
                        placeholder="Duration (mins)"
                        value={newTaskDuration}
                        onChange={(e) => setNewTaskDuration(e.target.value)}
                        className="input-glass"
                      />
                    </div>
                  )}

                  <div style={{ position: 'relative', width: '100%' }}>
                    <div
                      onClick={() => setTaskDatePickerOpen(!taskDatePickerOpen)}
                      className="input-glass"
                      style={{
                        width: '100%',
                        cursor: 'pointer',
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        padding: '10px 14px',
                        fontSize: '13px',
                        background: 'rgba(255, 255, 255, 0.03)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '10px',
                        color: '#fff',
                        height: '40px'
                      }}
                    >
                      <span>
                        {(() => {
                          const parts = newTaskDueDate.split('-');
                          if (parts.length === 3) {
                            return `${parts[2]}/${parts[1]}/${parts[0]}`;
                          }
                          return newTaskDueDate;
                        })()}
                      </span>
                      <CalendarIcon style={{ width: '15px', color: '#2dd4bf', opacity: 0.6 }} />
                    </div>

                    {taskDatePickerOpen && (
                      <div style={{
                        position: 'absolute',
                        bottom: '100%',
                        left: 0,
                        marginBottom: '8px',
                        width: '280px',
                        zIndex: 650,
                        padding: '14px',
                        background: 'linear-gradient(160deg, rgba(17, 17, 27, 0.98) 0%, rgba(10, 10, 18, 0.98) 100%)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '12px',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.6), 0 0 20px rgba(20, 184, 166, 0.05)',
                      }}>
                        {/* Calendar Month Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskCalendarMonth(prev => {
                                const newMonth = prev.month - 1;
                                return newMonth < 0
                                  ? { year: prev.year - 1, month: 11 }
                                  : { ...prev, month: newMonth };
                              });
                            }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                          >
                            <ChevronLeft style={{ width: '12px' }} />
                          </button>
                          <span style={{ fontSize: '12px', fontWeight: 700, fontFamily: 'var(--font-title)', color: '#fff' }}>
                            {new Date(taskCalendarMonth.year, taskCalendarMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskCalendarMonth(prev => {
                                const newMonth = prev.month + 1;
                                return newMonth > 11
                                  ? { year: prev.year + 1, month: 0 }
                                  : { ...prev, month: newMonth };
                              });
                            }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '6px', width: '26px', height: '26px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                          >
                            <ChevronRight style={{ width: '12px' }} />
                          </button>
                        </div>

                        {/* Weekday labels */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: '9px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '2px 0' }}>
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                          {(() => {
                            const { year, month } = taskCalendarMonth;
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const todayStr = formatDateStr(new Date());
                            const cells = [];

                            // Empty cells for days before the 1st
                            for (let i = 0; i < firstDay; i++) {
                              cells.push(<div key={`empty-${i}`} />);
                            }

                            for (let day = 1; day <= daysInMonth; day++) {
                              const dateStr = formatDateStr(new Date(year, month, day));
                              const isSelected = dateStr === newTaskDueDate;
                              const isToday = dateStr === todayStr;

                              cells.push(
                                <button
                                  type="button"
                                  key={day}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setNewTaskDueDate(dateStr);
                                    setTaskDatePickerOpen(false);
                                  }}
                                  style={{
                                    width: '100%',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: isSelected ? '1px solid #2dd4bf' : isToday ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid transparent',
                                    borderRadius: '6px',
                                    background: isSelected
                                      ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.1) 100%)'
                                      : isToday
                                        ? 'rgba(167, 139, 250, 0.08)'
                                        : 'transparent',
                                    color: isSelected ? '#2dd4bf' : isToday ? '#a78bfa' : '#fff',
                                    cursor: 'pointer',
                                    fontSize: '11px',
                                    fontWeight: isSelected || isToday ? 700 : 400,
                                    transition: 'all 0.15s ease',
                                    outline: 'none'
                                  }}
                                >
                                  {day}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>

                        {/* Today helper row */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid rgba(255,255,255,0.06)', marginTop: '8px', paddingTop: '8px' }}>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setNewTaskDueDate(formatDateStr(new Date()));
                              setTaskDatePickerOpen(false);
                            }}
                            style={{ background: 'none', border: 'none', color: '#2dd4bf', fontSize: '10px', fontWeight: 'bold', cursor: 'pointer', padding: 0 }}
                          >
                            Set to Today
                          </button>
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              setTaskDatePickerOpen(false);
                            }}
                            style={{ background: 'none', border: 'none', color: 'var(--text-muted)', fontSize: '10px', cursor: 'pointer', padding: 0 }}
                          >
                            Close
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <button type="submit" className="btn-primary" style={{ marginTop: '4px', width: '100%', height: '42px', justifyContent: 'center' }}>
                    <Plus style={{ width: '16px' }} /> Add Task
                  </button>
                </form>
              </div>

              {/* Right Column: AI Inbox to Action Paste Box */}
              <div className="glass-panel" style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '100%' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 600, marginBottom: '12px', color: '#a78bfa', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Sparkles style={{ width: '15px' }} /> AI Inbox-to-Action Paste Box
                </h3>
                <form onSubmit={handleExtractInbox} style={{ display: 'flex', flexDirection: 'column', gap: '8px', flexGrow: 1, height: '100%' }}>
                  <textarea
                    placeholder="Paste emails, messages, notes or announcements here (e.g. 'Technical architecture review scheduled for Friday')..."
                    value={inboxText}
                    onChange={(e) => setInboxText(e.target.value)}
                    className="input-glass"
                    style={{ width: '100%', flexGrow: 1, minHeight: '100px', resize: 'none', fontFamily: 'inherit', fontSize: '12px', lineHeight: 1.4, marginBottom: '12px' }}
                  />

                  {inboxLoading && <div style={{ fontSize: '11px', color: '#a78bfa', animation: 'pulse-mic 1s infinite' }}>Aegis is extracting actions...</div>}
                  {inboxError && <div style={{ fontSize: '11px', color: '#f87171' }}>Extraction failed: {inboxError}</div>}

                  {inboxResult && !inboxLoading && (
                    <div style={{ background: 'rgba(255,255,255,0.02)', padding: '10px 14px', border: '1px solid var(--border-subtle)', borderRadius: '10px', display: 'flex', flexDirection: 'column', gap: '4px', marginBottom: '12px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#fff' }}>Extracted: "{inboxResult.task.title}"</div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                        Deadline: {inboxResult.task.dueDate} | Effort: {inboxResult.estimated_hours}h | Subtasks: {inboxResult.subtasks.length}
                      </div>
                      <button type="button" onClick={handleImportInboxTask} className="action-btn-pill" style={{ background: 'rgba(167, 139, 250, 0.2)', color: '#c084fc', border: '1px solid rgba(167, 139, 250, 0.4)', marginTop: '8px', alignSelf: 'flex-start' }}>
                        Import as Focus Task & Schedule
                      </button>
                    </div>
                  )}

                  {!inboxResult && !inboxLoading && (
                    <button type="submit" className="btn-primary" style={{ background: 'linear-gradient(135deg, #7c3aed 0%, #6d28d9 100%)', borderColor: '#7c3aed', width: '100%', marginTop: 'auto', height: '42px', justifyContent: 'center' }}>
                      Convert to AI Action
                    </button>
                  )}
                </form>
              </div>

            </div>

            <div className="tasks-board">

              {/* To Do Column */}
              <div className="board-col">
                <div className="col-header">
                  <span className="col-title"><span className="priority-dot" style={{ background: 'var(--accent-red)' }} /> Flow Inbox</span>
                  <span className="col-count">
                    {(survivalModeActive ? todoTasks.filter(t => t.priority === 'high') : todoTasks).length}
                  </span>
                </div>
                <div className="col-cards">
                  {(survivalModeActive ? todoTasks.filter(t => t.priority === 'high') : todoTasks).map(task => (
                    <div key={task.id} className="task-card" style={{ borderColor: task.priority === 'high' ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-subtle)' }}>
                      <div className="task-card-header">
                        <span className="task-card-title">{task.title}</span>
                      </div>
                      <div style={{ margin: '6px 0 10px 0' }}>
                        {renderEnergyDots(task.cognitiveLoad || 3)}
                      </div>
                      <div className="task-card-desc">Category: {task.category} | Time: {task.duration}m</div>

                      {/* Subtasks checklists rendering */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '10px 0 6px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Subtasks Steps:</span>
                          {task.subtasks.map(sub => (
                            <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: sub.completed ? 'var(--text-muted-dark)' : 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubtask(task.id, sub.id)}
                                style={{ width: '12px', height: '12px', accentColor: 'var(--accent-teal)' }}
                              />
                              <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="task-card-footer">
                        <span className="task-card-date"><CalendarIcon style={{ width: '12px' }} /> {task.dueDate}</span>
                        <div className="task-card-actions">
                          <button onClick={() => handleUpdateStatus(task.id, 'in_progress')} className="task-action-btn start-btn" title="Start Task">
                            <Play style={{ width: '13px', height: '13px', fill: 'currentColor' }} />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} className="task-action-btn delete-btn" title="Delete">
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* In Progress Column */}
              <div className="board-col">
                <div className="col-header">
                  <span className="col-title"><span className="priority-dot" style={{ background: 'var(--accent-amber)' }} /> Active Flow</span>
                  <span className="col-count">
                    {(survivalModeActive ? inProgressTasks.filter(t => t.priority === 'high') : inProgressTasks).length}
                  </span>
                </div>
                <div className="col-cards">
                  {(survivalModeActive ? inProgressTasks.filter(t => t.priority === 'high') : inProgressTasks).map(task => (
                    <div key={task.id} className="task-card" style={{ borderColor: task.priority === 'high' ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-subtle)' }}>
                      <div className="task-card-header">
                        <span className="task-card-title">{task.title}</span>
                      </div>
                      <div style={{ margin: '6px 0 10px 0' }}>
                        {renderEnergyDots(task.cognitiveLoad || 3)}
                      </div>
                      <div className="task-card-desc">Category: {task.category} | Time: {task.duration}m</div>

                      {/* Subtasks checklists rendering */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '10px 0 6px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Subtasks Steps:</span>
                          {task.subtasks.map(sub => (
                            <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: sub.completed ? 'var(--text-muted-dark)' : 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubtask(task.id, sub.id)}
                                style={{ width: '12px', height: '12px', accentColor: 'var(--accent-teal)' }}
                              />
                              <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="task-card-footer">
                        <span className="task-card-date"><CalendarIcon style={{ width: '12px' }} /> {task.dueDate}</span>
                        <div className="task-card-actions">
                          <button onClick={() => handleUpdateStatus(task.id, 'completed')} className="task-action-btn complete-btn" title="Complete Task">
                            <Check style={{ width: '14px', height: '14px', strokeWidth: 3 }} />
                          </button>
                          <button onClick={() => handleUpdateStatus(task.id, 'todo')} className="task-action-btn back-btn" title="Move back to Inbox">
                            <ArrowLeft style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Completed Column */}
              <div className="board-col">
                <div className="col-header">
                  <span className="col-title"><span className="priority-dot" style={{ background: 'var(--accent-green)' }} /> Integrated</span>
                  <span className="col-count">
                    {(survivalModeActive ? completedTasks.filter(t => t.priority === 'high') : completedTasks).length}
                  </span>
                </div>
                <div className="col-cards">
                  {(survivalModeActive ? completedTasks.filter(t => t.priority === 'high') : completedTasks).map(task => (
                    <div key={task.id} className="task-card" style={{ opacity: 0.65, borderColor: task.priority === 'high' ? 'rgba(239, 68, 68, 0.25)' : 'var(--border-subtle)' }}>
                      <div className="task-card-header">
                        <span className="task-card-title" style={{ textDecoration: 'line-through' }}>{task.title}</span>
                      </div>
                      <div style={{ margin: '6px 0 10px 0' }}>
                        {renderEnergyDots(task.cognitiveLoad || 3)}
                      </div>
                      <div className="task-card-desc">Category: {task.category}</div>

                      {/* Subtasks checklists rendering */}
                      {task.subtasks && task.subtasks.length > 0 && (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '5px', margin: '10px 0 6px 0', borderTop: '1px solid var(--border-subtle)', paddingTop: '8px' }}>
                          <span style={{ fontSize: '9px', textTransform: 'uppercase', color: 'var(--text-muted)', fontWeight: 'bold' }}>Subtasks Steps:</span>
                          {task.subtasks.map(sub => (
                            <label key={sub.id} style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '11px', color: sub.completed ? 'var(--text-muted-dark)' : 'var(--text-main)', cursor: 'pointer' }}>
                              <input
                                type="checkbox"
                                checked={sub.completed}
                                onChange={() => handleToggleSubtask(task.id, sub.id)}
                                style={{ width: '12px', height: '12px', accentColor: 'var(--accent-teal)' }}
                              />
                              <span style={{ textDecoration: sub.completed ? 'line-through' : 'none' }}>{sub.title}</span>
                            </label>
                          ))}
                        </div>
                      )}

                      <div className="task-card-footer">
                        <span className="task-card-date"><CalendarIcon style={{ width: '12px' }} /> Completed</span>
                        <div className="task-card-actions">
                          <button onClick={() => handleUpdateStatus(task.id, 'in_progress')} className="task-action-btn start-btn" title="Reopen Task">
                            <RotateCcw style={{ width: '13px', height: '13px' }} />
                          </button>
                          <button onClick={() => handleDeleteTask(task.id)} className="task-action-btn delete-btn" title="Delete">
                            <Trash2 style={{ width: '13px', height: '13px' }} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          </>
        )}

        {/* AI PLANNER UI PAGE */}
        {activeTab === 'planner' && (
          <>
            <header className="view-header" style={{ flexDirection: 'column', alignItems: 'stretch', gap: '0' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <div className="view-title-wrap">
                  <h1>Planner</h1>
                  <p>Generate AI flow plans and view your scheduled focus blocks in one place.</p>
                </div>
                {survivalModeActive && (
                  <span style={{ fontSize: '11px', fontWeight: 'bold', padding: '4px 10px', borderRadius: '8px', background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', whiteSpace: 'nowrap' }}>
                    COMPRESSED PLAN ACTIVE
                  </span>
                )}
              </div>

              {/* Prominent Centered Date Navigator */}
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '14px',
                padding: '20px 24px',
                background: 'linear-gradient(135deg, rgba(20, 184, 166, 0.06) 0%, rgba(124, 58, 237, 0.06) 100%)',
                border: '1px solid rgba(255, 255, 255, 0.06)',
                borderRadius: '16px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '20px', width: '100%', justifyContent: 'center' }}>
                  <button
                    className="calendar-nav-btn"
                    onClick={() => {
                      const curr = new Date(selectedDate);
                      curr.setDate(curr.getDate() - 1);
                      setSelectedDate(formatDateStr(curr));
                    }}
                    style={{ width: '38px', height: '38px', borderRadius: '10px' }}
                  >
                    <ChevronLeft style={{ width: '18px' }} />
                  </button>

                  <div style={{ position: 'relative', display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: '200px' }}>
                    <div
                      onClick={() => {
                        const d = new Date(selectedDate + 'T00:00:00');
                        setCalendarViewMonth({ year: d.getFullYear(), month: d.getMonth() });
                        setCalendarOpen(!calendarOpen);
                      }}
                      style={{ cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '4px 16px', borderRadius: '10px', transition: 'background 0.2s', background: calendarOpen ? 'rgba(255,255,255,0.04)' : 'transparent' }}
                      title="Click to open calendar"
                    >
                      <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '1.5px', color: 'var(--text-muted)', fontWeight: 600 }}>
                        {(() => {
                          const d = new Date(selectedDate + 'T00:00:00');
                          return d.toLocaleDateString('en-US', { weekday: 'long' });
                        })()}
                      </span>
                      <span style={{ fontSize: '22px', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff', lineHeight: 1.3, display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {(() => {
                          const d = new Date(selectedDate + 'T00:00:00');
                          const day = d.getDate();
                          const month = d.toLocaleDateString('en-US', { month: 'long' });
                          const year = d.getFullYear();
                          return `${month} ${day}, ${year}`;
                        })()}
                      </span>
                      {selectedDate === formatDateStr(new Date()) && (
                        <span style={{ fontSize: '10px', fontWeight: 'bold', marginTop: '4px', padding: '2px 10px', borderRadius: '6px', background: 'rgba(20, 184, 166, 0.15)', color: '#2dd4bf', border: '1px solid rgba(20, 184, 166, 0.25)' }}>
                          TODAY
                        </span>
                      )}
                    </div>

                    {/* Full Month Calendar Popup */}
                    {calendarOpen && (
                      <div style={{
                        position: 'absolute',
                        top: '100%',
                        marginTop: '12px',
                        zIndex: 100,
                        width: '320px',
                        padding: '20px',
                        background: 'linear-gradient(160deg, rgba(17, 17, 27, 0.98) 0%, rgba(10, 10, 18, 0.98) 100%)',
                        backdropFilter: 'blur(24px)',
                        border: '1px solid rgba(255, 255, 255, 0.08)',
                        borderRadius: '16px',
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5), 0 0 40px rgba(20, 184, 166, 0.05)',
                      }}>
                        {/* Calendar Month Header */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCalendarViewMonth(prev => {
                                const newMonth = prev.month - 1;
                                return newMonth < 0
                                  ? { year: prev.year - 1, month: 11 }
                                  : { ...prev, month: newMonth };
                              });
                            }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                          >
                            <ChevronLeft style={{ width: '14px' }} />
                          </button>
                          <span style={{ fontSize: '14px', fontWeight: 700, fontFamily: 'var(--font-title)', color: '#fff' }}>
                            {new Date(calendarViewMonth.year, calendarViewMonth.month).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                          </span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setCalendarViewMonth(prev => {
                                const newMonth = prev.month + 1;
                                return newMonth > 11
                                  ? { year: prev.year + 1, month: 0 }
                                  : { ...prev, month: newMonth };
                              });
                            }}
                            style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: '8px', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', color: '#fff' }}
                          >
                            <ChevronRight style={{ width: '14px' }} />
                          </button>
                        </div>

                        {/* Weekday labels */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '6px' }}>
                          {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
                            <div key={d} style={{ textAlign: 'center', fontSize: '10px', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.5px', padding: '4px 0' }}>
                              {d}
                            </div>
                          ))}
                        </div>

                        {/* Calendar Days Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
                          {(() => {
                            const { year, month } = calendarViewMonth;
                            const firstDay = new Date(year, month, 1).getDay();
                            const daysInMonth = new Date(year, month + 1, 0).getDate();
                            const todayStr = formatDateStr(new Date());
                            const cells = [];

                            // Empty cells for days before the 1st
                            for (let i = 0; i < firstDay; i++) {
                              cells.push(<div key={`empty-${i}`} />);
                            }

                            for (let day = 1; day <= daysInMonth; day++) {
                              const dateStr = formatDateStr(new Date(year, month, day));
                              const isSelected = dateStr === selectedDate;
                              const isToday = dateStr === todayStr;
                              const tasksDue = tasks.filter(t => t.dueDate === dateStr && t.status !== 'completed').length;
                              const hasEvents = events.some(e => e.startTime && e.startTime.startsWith(dateStr));

                              cells.push(
                                <button
                                  key={day}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setSelectedDate(dateStr);
                                    setCalendarOpen(false);
                                  }}
                                  style={{
                                    position: 'relative',
                                    width: '100%',
                                    aspectRatio: '1',
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    border: isSelected ? '1px solid #2dd4bf' : isToday ? '1px solid rgba(167, 139, 250, 0.4)' : '1px solid transparent',
                                    borderRadius: '10px',
                                    background: isSelected
                                      ? 'linear-gradient(135deg, rgba(20, 184, 166, 0.25) 0%, rgba(20, 184, 166, 0.1) 100%)'
                                      : isToday
                                        ? 'rgba(167, 139, 250, 0.08)'
                                        : 'transparent',
                                    color: isSelected ? '#2dd4bf' : isToday ? '#a78bfa' : '#fff',
                                    cursor: 'pointer',
                                    fontSize: '13px',
                                    fontWeight: isSelected || isToday ? 700 : 400,
                                    transition: 'all 0.15s ease',
                                  }}
                                  onMouseEnter={(e) => { if (!isSelected) e.currentTarget.style.background = 'rgba(255,255,255,0.04)'; }}
                                  onMouseLeave={(e) => { if (!isSelected && !isToday) e.currentTarget.style.background = 'transparent'; else if (isToday && !isSelected) e.currentTarget.style.background = 'rgba(167, 139, 250, 0.08)'; }}
                                >
                                  {day}
                                  {(tasksDue > 0 || hasEvents) && (
                                    <div style={{ display: 'flex', gap: '2px', position: 'absolute', bottom: '3px' }}>
                                      {tasksDue > 0 && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#a78bfa' }} />}
                                      {hasEvents && <span style={{ width: '4px', height: '4px', borderRadius: '50%', background: '#2dd4bf' }} />}
                                    </div>
                                  )}
                                </button>
                              );
                            }
                            return cells;
                          })()}
                        </div>

                        {/* Quick jump to today */}
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            const now = new Date();
                            setSelectedDate(formatDateStr(now));
                            setCalendarViewMonth({ year: now.getFullYear(), month: now.getMonth() });
                            setCalendarOpen(false);
                          }}
                          style={{ width: '100%', marginTop: '12px', padding: '8px', background: 'rgba(20, 184, 166, 0.08)', border: '1px solid rgba(20, 184, 166, 0.2)', borderRadius: '10px', color: '#2dd4bf', fontSize: '12px', fontWeight: 600, cursor: 'pointer', transition: 'background 0.2s' }}
                        >
                          Jump to Today
                        </button>
                      </div>
                    )}
                  </div>

                  <button
                    className="calendar-nav-btn"
                    onClick={() => {
                      const curr = new Date(selectedDate);
                      curr.setDate(curr.getDate() + 1);
                      setSelectedDate(formatDateStr(curr));
                    }}
                    style={{ width: '38px', height: '38px', borderRadius: '10px' }}
                  >
                    <ChevronRight style={{ width: '18px' }} />
                  </button>
                </div>

                {/* Date context stats */}
                <div style={{ display: 'flex', gap: '20px', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CheckSquare style={{ width: '13px', color: '#a78bfa' }} />
                    <strong style={{ color: '#fff' }}>{tasks.filter(t => t.dueDate === selectedDate && t.status !== 'completed').length}</strong> tasks due
                  </span>
                  <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <CalendarIcon style={{ width: '13px', color: '#2dd4bf' }} />
                    <strong style={{ color: '#fff' }}>{selectedDateEvents.length}</strong> events scheduled
                  </span>
                  <span style={{ width: '1px', height: '14px', background: 'rgba(255,255,255,0.1)' }} />
                  <span style={{ fontSize: '12px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <Clock style={{ width: '13px', color: '#f59e0b' }} />
                    <strong style={{ color: '#fff' }}>{tasks.filter(t => t.dueDate === selectedDate && t.status !== 'completed').reduce((a, t) => a + (t.duration || 30), 0)}</strong> min workload
                  </span>
                </div>

                {/* Generate button */}
                <button
                  className="btn-primary"
                  onClick={handleGenerateAIPlan}
                  disabled={plannerLoading}
                  style={{ marginTop: '4px', padding: '10px 28px', fontSize: '13px' }}
                >
                  <Sparkles style={{ width: '16px' }} />
                  {plannerLoading ? "Harmonizing..." : "Generate AI Flow Plan"}
                </button>
              </div>
            </header>

            {/* WEEKLY OPTIMIZER AGENT WIDGET */}
            <WeeklyOptimizer
              data={weeklyOptData}
              loading={weeklyOptLoading}
              error={weeklyOptError}
              onOptimize={handleOptimizeWeek}
            />

            <div className="dashboard-grid" style={{ gridTemplateColumns: '1.4fr 0.6fr' }}>

              {/* Suggested Timeline (primary) */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', minHeight: '380px' }}>

                {plannerLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '40px 0' }}>
                    <div className="breathing-circle inhale" style={{ width: '80px', height: '80px', animation: 'pulse-mic 1.5s infinite', background: 'rgba(20, 184, 166, 0.2)' }}>
                      <Sparkles style={{ width: '28px', height: '28px', color: '#2dd4bf' }} />
                    </div>
                    <p style={{ marginTop: '24px', fontSize: '14px', fontWeight: 500, fontFamily: 'var(--font-title)', color: '#2dd4bf', textAlign: 'center' }}>
                      {plannerLoadingPhrases[plannerPhraseIndex]}
                    </p>
                  </div>
                )}

                {plannerError && !plannerLoading && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '30px 10px', textAlign: 'center' }}>
                    <AlertCircle style={{ color: 'var(--accent-red)', width: '36px', height: '36px', marginBottom: '14px' }} />
                    <p style={{ fontSize: '14px', color: '#f87171', marginBottom: '20px', lineHeight: 1.5 }}>{plannerError}</p>
                    <button className="action-btn-pill" onClick={handleGenerateAIPlan}>
                      Try Again
                    </button>
                  </div>
                )}

                {plannerSchedule.length === 0 && !plannerLoading && !plannerError && (
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', flexGrow: 1, padding: '40px 10px', textAlign: 'center', color: 'var(--text-muted)' }}>
                    <Bot style={{ width: '48px', height: '48px', color: 'var(--accent-teal)', marginBottom: '16px' }} />
                    <h3>Aegis Flow Planner</h3>
                    <p style={{ fontSize: '13px', maxWidth: '280px', marginTop: '8px', lineHeight: 1.5 }}>
                      Click "Generate AI Flow Plan" to let Aegis analyze task priorities and arrange a perfectly balanced box-scheduled day for {selectedDate}.
                    </p>
                  </div>
                )}

                {plannerSchedule.length > 0 && !plannerLoading && (
                  <>
                    <div style={{ padding: '16px', background: 'rgba(20, 184, 166, 0.05)', border: '1px solid rgba(20, 184, 166, 0.15)', borderRadius: '14px', marginBottom: '24px', fontSize: '13px', lineHeight: 1.5, color: '#2dd4bf' }}>
                      <strong>Aegis Suggestion:</strong> {plannerSummary}
                    </div>

                    <div className="dashboard-panel-header">
                      <h2>Suggested Timeline</h2>
                      <div style={{ display: 'flex', gap: '8px' }}>
                        <button className="action-btn-pill" onClick={handleCommitAIPlan} style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(20,184,166,0.2)' }}>
                          <Check style={{ width: '13px' }} /> Commit Schedule
                        </button>
                        <button className="action-btn-pill" onClick={handleGenerateAIPlan} style={{ background: 'none' }}>
                          Replan
                        </button>
                      </div>
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', overflowY: 'auto', maxHeight: '350px', paddingRight: '4px' }}>
                      {plannerSchedule.map((block, idx) => {
                        const isBreak = block.type === 'break';
                        return (
                          <div
                            key={idx}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '14px',
                              padding: '12px 16px',
                              background: isBreak ? 'rgba(20, 184, 166, 0.03)' : 'rgba(255, 255, 255, 0.015)',
                              border: '1px solid',
                              borderColor: isBreak ? 'rgba(20, 184, 166, 0.15)' : 'var(--border-subtle)',
                              borderRadius: '12px'
                            }}
                          >
                            <div style={{ background: isBreak ? 'rgba(20, 184, 166, 0.1)' : 'rgba(255, 255, 255, 0.04)', padding: '8px', borderRadius: '50%' }}>
                              {isBreak ? (
                                <Wind style={{ width: '16px', height: '16px', color: '#2dd4bf' }} />
                              ) : (
                                <CheckCircle2 style={{ width: '16px', height: '16px', color: '#a78bfa' }} />
                              )}
                            </div>

                            <div style={{ flexGrow: 1 }}>
                              <h4 style={{ fontSize: '13px', fontWeight: 600, color: isBreak ? '#2dd4bf' : 'var(--text-main)' }}>{block.title}</h4>
                              <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                                {formatTimeStr(block.startTime)} - {formatTimeStr(block.endTime)} ({block.duration}m)
                              </span>
                            </div>

                            {!isBreak && (
                              <span style={{ fontSize: '9px', textTransform: 'uppercase', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                                Focus Block
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  </>
                )}

              </div>

              {/* Active Inbox (secondary) */}
              <div className="glass-panel" style={{ padding: '24px' }}>
                <div className="dashboard-panel-header">
                  <h2>Active Inbox</h2>
                  <span className="col-count">
                    {tasks.filter(t => t.status !== 'completed' && t.dueDate <= selectedDate && (!survivalModeActive || t.priority === 'high')).length} Items
                  </span>
                </div>

                <div className="urgent-tasks-list" style={{ maxHeight: '420px', overflowY: 'auto' }}>
                  {tasks.filter(t => t.status !== 'completed' && t.dueDate <= selectedDate && (!survivalModeActive || t.priority === 'high')).length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '50px 0' }}>
                      <CheckSquare style={{ margin: '0 auto 10px auto', width: '32px', height: '32px' }} />
                      <p style={{ fontSize: '13px' }}>No active focus items to plan.</p>
                    </div>
                  ) : (
                    tasks.filter(t => t.status !== 'completed' && t.dueDate <= selectedDate && (!survivalModeActive || t.priority === 'high')).map(task => (
                      <div key={task.id} style={{ display: 'flex', flexDirection: 'column', gap: '8px', padding: '14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', borderRadius: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <span style={{ fontWeight: 600, fontSize: '14px' }}>{task.title}</span>
                          <span style={{ fontSize: '10px', textTransform: 'uppercase', padding: '2px 6px', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', color: 'var(--text-muted)' }}>{task.category}</span>
                        </div>
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px', fontSize: '12px', color: 'var(--text-muted)' }}>
                            <Clock style={{ width: '12px' }} /> {task.duration} mins
                          </div>
                          {renderEnergyDots(task.cognitiveLoad || 3)}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>

            </div>

            {/* Scheduled Calendar Timeline */}
            <div className="calendar-layout" style={{ marginTop: '24px' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                <h2 style={{ fontSize: '16px', fontWeight: 700, fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <CalendarIcon style={{ width: '18px', color: '#a78bfa' }} /> Scheduled Timeline
                </h2>
              </div>
              <div className="calendar-timeline">
                {CALENDAR_HOURS.map(hour => {
                  const displayHour = hour > 12 ? hour - 12 : hour;
                  const ampm = hour >= 12 ? 'PM' : 'AM';

                  const hourEvents = selectedDateEvents.filter(event => {
                    const evDate = new Date(event.startTime);
                    return evDate.getHours() === hour;
                  });

                  return (
                    <div key={hour} className="calendar-hour-row">
                      <div className="calendar-hour-label">
                        {displayHour}:00 {ampm}
                      </div>
                      <div className="calendar-slots">
                        {hourEvents.map(event => {
                          const evDate = new Date(event.startTime);
                          const evMinutes = evDate.getMinutes();
                          const topOffset = (evMinutes / 60) * 48 + 8;
                          const heightOffset = (event.duration / 60) * 48;

                          return (
                            <div
                              key={event.id}
                              className="scheduled-event"
                              style={{
                                top: `${topOffset}px`,
                                height: `${Math.max(36, heightOffset)}px`
                              }}
                            >
                              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                                {event.title}
                              </span>
                              <span className="event-time">
                                {evMinutes.toString().padStart(2, '0')}m | {event.duration}m duration
                              </span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </>
        )}

        {activeTab === 'habits' && (() => {
          const doneCount = habits.filter(h => h.history.includes(formatDateStr(new Date()))).length;
          const totalCount = habits.length;
          const disciplineScore = totalCount > 0 ? Math.round((doneCount / totalCount) * 100) : 0;
          const maxStreakVal = habits.length > 0 ? Math.max(...habits.map(h => h.streak || 0), 12) : 12;

          return (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', paddingBottom: '40px' }}>
              <header className="view-header">
                <div className="view-title-wrap">
                  <h1>Zen Habits</h1>
                  <p>Track your daily disciplines, review automated habit analytics, and build momentum.</p>
                </div>
                {survivalModeActive && (
                  <div style={{ background: 'rgba(239, 68, 68, 0.15)', color: '#f87171', border: '1px solid rgba(239, 68, 68, 0.3)', padding: '6px 14px', borderRadius: '10px', fontSize: '12px', fontWeight: 'bold' }}>
                    HABITS PAUSED (Survival Mode overrides wellness cycles)
                  </div>
                )}
              </header>

              {/* Part 1: Today's Discipline Score (Full Width) */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', position: 'relative', overflow: 'hidden' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div>
                    <h3 style={{ fontSize: '14px', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '1px', fontWeight: 'bold', margin: 0 }}>Today's Discipline Score</h3>
                    <div style={{ display: 'flex', gap: '16px', alignItems: 'center', marginTop: '8px' }}>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        🔥 Current Streak: <strong style={{ color: '#f59e0b' }}>{maxStreakVal} Days</strong>
                      </span>
                      <span style={{ color: 'var(--border-subtle)' }}>|</span>
                      <span style={{ fontSize: '13px', color: 'var(--text-muted)' }}>
                        🎯 Habits Done: <strong style={{ color: 'var(--accent-teal)' }}>{doneCount}/{totalCount}</strong>
                      </span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
                    <span style={{ fontSize: '48px', fontWeight: 800, fontFamily: 'var(--font-title)', color: '#fff', lineHeight: 1 }}>
                      {disciplineScore}%
                    </span>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ height: '8px', background: 'rgba(255,255,255,0.03)', borderRadius: '4px', overflow: 'hidden', width: '100%' }}>
                  <div
                    style={{
                      height: '100%',
                      width: `${disciplineScore}%`,
                      background: 'linear-gradient(90deg, #0d9488 0%, #2dd4bf 100%)',
                      borderRadius: '4px',
                      transition: 'width 0.4s ease'
                    }}
                  />
                </div>
              </div>

              {/* Part 2: Today's Habits & AI Habit Coach (Side by Side) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

                {/* Today's Habits (Left) */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)', margin: 0 }}>
                    <CheckSquare style={{ width: '16px' }} /> Today's Habits
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    {habits.length === 0 ? (
                      <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '20px 0', fontSize: '13px' }}>
                        No habits tracked. Add one in the library below!
                      </div>
                    ) : (
                      habits.map(habit => {
                        const isDone = habit.history.includes(formatDateStr(new Date()));
                        return (
                          <div
                            key={habit.id}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '12px',
                              padding: '12px 14px',
                              background: isDone ? 'rgba(20, 184, 166, 0.03)' : 'rgba(255,255,255,0.01)',
                              borderRadius: '10px',
                              border: '1px solid',
                              borderColor: isDone ? 'rgba(20, 184, 166, 0.2)' : 'rgba(255,255,255,0.04)',
                              transition: 'var(--transition-smooth)'
                            }}
                          >
                            <input
                              type="checkbox"
                              checked={isDone}
                              onChange={() => handleToggleHabitDay(habit.id, formatDateStr(new Date()))}
                              style={{
                                width: '18px',
                                height: '18px',
                                accentColor: 'var(--accent-teal)',
                                cursor: 'pointer',
                                borderRadius: '4px'
                              }}
                            />
                            <span style={{
                              fontSize: '13px',
                              fontWeight: 500,
                              color: isDone ? 'var(--text-muted)' : '#fff',
                              textDecoration: isDone ? 'line-through' : 'none',
                              flexGrow: 1
                            }}>
                              {habit.title}
                            </span>
                            <span style={{ fontSize: '11px', color: '#f59e0b', display: 'flex', alignItems: 'center', gap: '2px' }}>
                              🔥 {habit.streak}d
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>

                {/* AI Habit Coach (Right) */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.03) 0%, rgba(45, 212, 191, 0.01) 100%)', borderColor: 'rgba(139, 92, 246, 0.15)' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', margin: 0 }}>
                    <Bot style={{ width: '16px' }} /> AI Habit Coach
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', flexGrow: 1 }}>
                    <div style={{ background: 'rgba(255,255,255,0.015)', border: '1px solid rgba(255,255,255,0.03)', padding: '14px 18px', borderRadius: '12px', fontSize: '13px', lineHeight: 1.5, color: '#e9d5ff' }}>
                      "Morning planning has been your strongest habit. Establishing a consistent start to your day yields 3.5x payoff in cognitive load margins later."
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '12px', color: 'var(--text-muted)', background: 'rgba(20, 184, 166, 0.05)', padding: '8px 12px', borderRadius: '8px', border: '1px solid rgba(20, 184, 166, 0.1)' }}>
                      <Sparkles style={{ width: '13px', color: 'var(--accent-teal)' }} />
                      <span>Suggested focus: <strong>Deep Work</strong></span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Part 3: Habit Library (Full Width) */}
              <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '18px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#fff', margin: 0 }}>
                    <Sparkles style={{ width: '16px', color: '#a78bfa' }} /> Habit Library & 7-Day History
                  </h3>

                  {/* Form to Add Habit Inline */}
                  <form onSubmit={handleAddHabit} style={{ display: 'flex', gap: '8px' }}>
                    <input
                      type="text"
                      placeholder="New habit title..."
                      value={newHabitTitle}
                      onChange={(e) => setNewHabitTitle(e.target.value)}
                      style={{
                        background: 'rgba(0,0,0,0.2)',
                        border: '1px solid var(--border-subtle)',
                        borderRadius: '8px',
                        padding: '6px 12px',
                        fontSize: '12.5px',
                        color: '#fff',
                        outline: 'none',
                        width: '180px'
                      }}
                    />
                    <button
                      type="submit"
                      className="action-btn-pill"
                      style={{ background: 'var(--accent-teal)', color: '#000', fontWeight: 'bold', border: 'none', padding: '6px 14px', fontSize: '11px', cursor: 'pointer', borderRadius: '8px' }}
                    >
                      + Add Habit
                    </button>
                  </form>
                </div>

                {/* Habit Cards Library Grid */}
                <div className="habits-grid" style={{ opacity: survivalModeActive ? 0.45 : 1, pointerEvents: survivalModeActive ? 'none' : 'auto' }}>
                  {habits.map(habit => (
                    <div key={habit.id} className="glass-panel habit-card" style={{ background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.04)', padding: '16px', position: 'relative' }}>
                      <div className="habit-header" style={{ marginBottom: '12px' }}>
                        <span className="habit-title" style={{ fontSize: '14px', color: '#fff', fontWeight: 600 }}>{habit.title}</span>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          <span className="habit-streak" style={{ fontSize: '11px', padding: '2px 6px' }}>
                            <Flame style={{ width: '10px', fill: 'var(--accent-teal)' }} /> {habit.streak}d
                          </span>
                          <button
                            onClick={() => handleRemoveHabit(habit.id)}
                            style={{
                              background: 'none',
                              border: 'none',
                              color: 'rgba(239, 68, 68, 0.4)',
                              cursor: 'pointer',
                              fontSize: '12px',
                              padding: '2px',
                              transition: 'var(--transition-smooth)'
                            }}
                            onMouseEnter={(e) => e.currentTarget.style.color = '#ef4444'}
                            onMouseLeave={(e) => e.currentTarget.style.color = 'rgba(239, 68, 68, 0.4)'}
                            title="Delete habit"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                      <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '8px' }}>Daily Tracker (Last 7 Days)</div>
                      <div className="habit-grid-days">
                        {Array.from({ length: 7 }, (_, i) => {
                          const dayDate = new Date();
                          dayDate.setDate(dayDate.getDate() - (6 - i));
                          const dateStr = formatDateStr(dayDate);
                          const isDone = habit.history.includes(dateStr);
                          const weekday = dayDate.toLocaleDateString('en-US', { weekday: 'narrow' });

                          return (
                            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '4px' }}>
                              <button
                                className={`habit-day-dot ${isDone ? 'completed' : ''}`}
                                onClick={() => handleToggleHabitDay(habit.id, dateStr)}
                                title={dateStr}
                                style={{ width: '22px', height: '22px', borderRadius: '5px' }}
                              />
                              <span style={{ fontSize: '10px', color: 'var(--text-muted-dark)' }}>{weekday}</span>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Part 4: Weekly Heatmap & Habit Insights (Side by Side) */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '20px' }}>

                {/* Weekly Heatmap (Left) */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-teal)', margin: 0 }}>
                    <CalendarIcon style={{ width: '16px' }} /> Weekly Heatmap
                  </h3>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '11px', color: 'var(--text-muted)' }}>
                      <span>Activity (Last 4 Weeks)</span>
                      <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
                        Less <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: 'rgba(255,255,255,0.05)' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#84e1bc' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#31c48d' }} />
                        <span style={{ width: '8px', height: '8px', borderRadius: '2px', background: '#0e9f6e' }} /> More
                      </span>
                    </div>

                    {/* Grid layout */}
                    <div style={{ display: 'flex', gap: '8px', background: 'rgba(0,0,0,0.1)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border-subtle)' }}>
                      {/* Days of week header labels column */}
                      <div style={{ display: 'grid', gridTemplateRows: 'repeat(7, 12px)', gap: '4px', fontSize: '9px', color: 'var(--text-muted-dark)', alignContent: 'center', paddingRight: '4px' }}>
                        <span>M</span><span>T</span><span>W</span><span>T</span><span>F</span><span>S</span><span>S</span>
                      </div>

                      {/* Columns of heatmap squares (4 weeks = 4 columns of 7 squares = 28 squares) */}
                      <div style={{ display: 'grid', gridAutoFlow: 'column', gridTemplateColumns: 'repeat(4, 12px)', gridTemplateRows: 'repeat(7, 12px)', gap: '4px', flexGrow: 1 }}>
                        {Array.from({ length: 28 }, (_, idx) => {
                          const dayOffset = 27 - idx;
                          const targetDate = new Date();
                          targetDate.setDate(targetDate.getDate() - dayOffset);
                          const targetStr = formatDateStr(targetDate);

                          // Calculate completion percentage across all habits for this date
                          const total = habits.length;
                          const completed = habits.filter(h => h.history.includes(targetStr)).length;
                          const ratio = total > 0 ? (completed / total) : 0;

                          // Pick color based on completion ratio
                          let bgColor = 'rgba(255, 255, 255, 0.04)';
                          if (ratio === 1) bgColor = '#0e9f6e'; // 100% completed
                          else if (ratio >= 0.5) bgColor = '#31c48d'; // 50%-99%
                          else if (ratio > 0) bgColor = '#84e1bc'; // 1%-49%

                          return (
                            <div
                              key={idx}
                              style={{
                                background: bgColor,
                                borderRadius: '2px',
                                width: '12px',
                                height: '12px'
                              }}
                              title={`${targetStr}: ${completed}/${total} habits done`}
                            />
                          );
                        })}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Habit Insights (Right) */}
                <div className="glass-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px', color: '#a78bfa', margin: 0 }}>
                    <Flame style={{ width: '16px' }} /> Habit Insights
                  </h3>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', flexGrow: 1, justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Best day:</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: 'var(--accent-teal)' }}>Tuesday (92% completion)</span>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'rgba(255,255,255,0.01)', border: '1px solid rgba(255,255,255,0.03)', padding: '10px 14px', borderRadius: '8px' }}>
                      <span style={{ fontSize: '12.5px', color: 'var(--text-muted)' }}>Missed:</span>
                      <span style={{ fontSize: '13px', fontWeight: 'bold', color: '#f87171' }}>Friday mornings</span>
                    </div>
                  </div>
                </div>

              </div>

            </div>
          );
        })()}

        {activeTab === 'settings' && (
          <div className="view-container">
            <header className="view-header" style={{ marginBottom: '8px' }}>
              <div className="view-title-wrap">
                <h1>Config Panel</h1>
                <p>Adjust voice synthesis frequency, enter access credentials, and track timeline adaptations.</p>
              </div>
            </header>

            <div style={{ maxWidth: '720px', width: '100%', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '24px' }}>

              {/* Card: Workspace Mode */}
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#fbbf24', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Shield style={{ width: '18px', color: '#fbbf24' }} /> Workspace Environment
                </h3>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '12px' }}>
                  <div>
                    <strong style={{ fontSize: '13px', color: '#fff', display: 'block', marginBottom: '4px' }}>Demo Mode Active</strong>
                    <span style={{ fontSize: '11px', color: 'var(--text-muted)' }}>
                      {isDemoMode 
                        ? 'Currently using mock productivity data for hackathon evaluation.' 
                        : 'Using your personal persistent browser storage.'}
                    </span>
                  </div>
                  <button
                    onClick={() => setIsDemoMode(!isDemoMode)}
                    className="action-btn-pill"
                    style={{
                      background: isDemoMode ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255,255,255,0.03)',
                      borderColor: isDemoMode ? 'rgba(245, 158, 11, 0.25)' : 'rgba(255,255,255,0.08)',
                      color: isDemoMode ? '#fbbf24' : 'var(--text-muted)',
                      cursor: 'pointer'
                    }}
                  >
                    {isDemoMode ? 'Switch to Real Mode' : 'Switch to Demo Mode'}
                  </button>
                </div>
                {isDemoMode && (
                  <button
                    onClick={() => {
                      localStorage.removeItem('demo_tasks');
                      localStorage.removeItem('demo_events');
                      localStorage.removeItem('demo_habits');
                      loadDemoModeData();
                      alert('Demo workspace data reset successfully.');
                    }}
                    className="action-btn-pill"
                    style={{
                      marginTop: '8px',
                      alignSelf: 'flex-start',
                      background: 'rgba(239, 68, 68, 0.1)',
                      borderColor: 'rgba(239, 68, 68, 0.2)',
                      color: '#f87171',
                      cursor: 'pointer'
                    }}
                  >
                    Reset Demo Data
                  </button>
                )}
              </div>

              {/* Card 1: LLM Engine (API Credentials) */}
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#2dd4bf', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Settings style={{ width: '18px' }} /> Google Gemini Credentials
                </h3>
                <div className="settings-group">
                  <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>API Studio Key</label>
                  <input
                    type="password"
                    placeholder="Insert gemini-1.5-flash compatible API key"
                    value={apiKey}
                    onChange={(e) => {
                      setApiKey(e.target.value);
                      localStorage.setItem('vibe_gemini_key', e.target.value);
                    }}
                    className="input-glass"
                    style={{ width: '100%', padding: '10px 14px' }}
                  />
                  <p style={{ fontSize: '11px', color: 'var(--text-muted)', marginTop: '8px', marginBottom: 0, lineHeight: 1.45 }}>
                    Need a key? Visit the <a href="https://aistudio.google.com/" target="_blank" rel="noreferrer" style={{ color: 'var(--accent-teal)', textDecoration: 'underline' }}>Google AI Studio console</a> to retrieve one for free.
                  </p>
                </div>
              </div>

              {/* Card 2: Audio Accountability (Vocal Synthesis Settings) */}
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#a78bfa', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Volume2 style={{ width: '18px' }} /> Vocal Synthesis Engine
                </h3>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '16px' }}>
                  <div className="settings-group">
                    <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Voice Selection</label>
                    <select
                      className="select-glass"
                      value={selectedVoice}
                      onChange={(e) => setSelectedVoice(e.target.value)}
                      style={{ width: '100%' }}
                    >
                      {voices.map((v, i) => (
                        <option key={i} value={v.name}>{v.name} ({v.lang})</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1.2fr 0.8fr', gap: '20px', alignItems: 'flex-end', marginTop: '4px' }}>
                    <div className="settings-group">
                      <label style={{ fontSize: '10px', color: 'var(--text-muted)', letterSpacing: '0.5px' }}>Playback Speed: {voiceSpeed}x</label>
                      <input
                        type="range"
                        min="0.5"
                        max="1.5"
                        step="0.05"
                        value={voiceSpeed}
                        onChange={(e) => setVoiceSpeed(parseFloat(e.target.value))}
                        style={{ accentColor: 'var(--accent-teal)', width: '100%', height: '36px', background: 'transparent' }}
                      />
                    </div>

                    <button
                      onClick={() => setSpeechEnabled(!speechEnabled)}
                      className="mic-btn"
                      style={{ width: '100%', height: '40px', display: 'flex', gap: '8px', fontSize: '12px', fontWeight: 'bold', justifyContent: 'center', alignItems: 'center', borderRadius: '10px', transition: 'all 0.2s ease' }}
                    >
                      {speechEnabled ? (
                        <>
                          <Volume2 style={{ width: '15px' }} /> Audio: Active
                        </>
                      ) : (
                        <>
                          <VolumeX style={{ width: '15px' }} /> Audio: Muted
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Card 3: Audit Trails (Adaptation Log) */}
              <div className="glass-panel" style={{ padding: '28px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                <h3 style={{ fontSize: '15px', fontWeight: 700, color: '#f59e0b', fontFamily: 'var(--font-title)', display: 'flex', alignItems: 'center', gap: '8px', margin: 0 }}>
                  <Clock style={{ width: '18px' }} /> Adaptation Activity Log
                </h3>
                <div>
                  {history.length === 0 ? (
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', textAlign: 'center', padding: '30px 10px' }}>
                      <Clock style={{ width: '28px', height: '28px', marginBottom: '10px', opacity: 0.4 }} />
                      <p style={{ fontSize: '12.5px', margin: 0 }}>No schedule changes logged yet. Generate focus timelines or request reschedules to populate this audit trail.</p>
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', maxHeight: '200px', overflowY: 'auto', paddingRight: '4px' }}>
                      {history.map(log => (
                        <div key={log.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'rgba(255,255,255,0.01)', border: '1px solid var(--border-subtle)', borderRadius: '8px' }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', overflow: 'hidden' }}>
                            <span style={{ fontSize: '8px', textTransform: 'uppercase', fontWeight: 800, padding: '3px 6px', borderRadius: '4px', background: log.type === 'plan' ? 'rgba(20,184,166,0.15)' : 'rgba(245,158,11,0.15)', color: log.type === 'plan' ? '#2dd4bf' : '#f59e0b', flexShrink: 0 }}>
                              {log.type}
                            </span>
                            <span style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text-main)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '420px' }} title={log.description}>
                              {log.description}
                            </span>
                          </div>
                          <span style={{ fontSize: '11px', color: 'var(--text-muted)', flexShrink: 0 }}>
                            {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Card 4: Danger Zone (Database Wipe) */}
              <div className="glass-panel" style={{ padding: '24px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', border: '1px solid rgba(239, 68, 68, 0.25)', background: 'rgba(239, 68, 68, 0.02)', borderRadius: '12px', flexWrap: 'wrap', gap: '16px' }}>
                <div style={{ flex: '1 1 350px' }}>
                  <h4 style={{ color: '#f87171', fontSize: '13px', fontWeight: 700, margin: '0 0 2px 0' }}>Danger Zone</h4>
                  <p style={{ fontSize: '11.5px', color: 'var(--text-muted)', margin: 0 }}>Irreversibly wipe all local storage data. This resets your streaks, habits, credentials, keys, and focus items.</p>
                </div>
                <button
                  onClick={handleResetStorage}
                  className="btn-primary"
                  style={{ background: 'rgba(239, 68, 68, 0.15)', border: '1px solid rgba(239, 68, 68, 0.3)', color: '#f87171', boxShadow: 'none', padding: '8px 16px', fontSize: '12px', cursor: 'pointer' }}
                >
                  <RotateCcw style={{ width: '14px' }} /> Reset Local Database
                </button>
              </div>

            </div>
          </div>
        )}

      </main>

      {/* Floating Right AI Companion Chat Panel */}
      <section className={`chat-drawer-container ${chatOpen ? 'open' : ''}`}>
        <header className="chat-header">
          <div className="chat-avatar-wrap">
            <Bot style={{ color: 'var(--accent-teal)', width: '22px' }} />
            <div>
              <h3 style={{ fontSize: '14px', fontFamily: 'var(--font-title)', fontWeight: 600 }}>Aegis Zen Coach</h3>
              <span style={{ fontSize: '10px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <span className={`coach-status ${isThinking ? 'thinking' : ''}`} /> {isThinking ? 'Reading Flow...' : 'Standing By'}
              </span>
            </div>
          </div>
          <button className="chat-close-btn" onClick={() => setChatOpen(false)} title="Close Chat">✕</button>
        </header>

        <div className="chat-messages">
          {messages.map((msg, i) => (
            <div key={i} className={`message-bubble ${msg.sender}`}>
              {msg.text}
            </div>
          ))}
          {isThinking && (
            <div className="message-bubble assistant" style={{ fontStyle: 'italic', color: 'var(--text-muted)' }}>
              Flowing thoughts...
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <div className="chat-input-area">
          <button
            onClick={toggleSpeechRecognition}
            className={`mic-btn ${isListening ? 'active' : ''}`}
            title="Speech Input Toggle"
          >
            {isListening ? <MicOff style={{ width: '18px' }} /> : <Mic style={{ width: '18px' }} />}
          </button>
          <input
            type="text"
            placeholder="Type a calming schedule request..."
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSendChatMessage();
            }}
            className="input-glass"
          />
          <button onClick={() => handleSendChatMessage()} className="btn-primary" style={{ padding: '10px' }}>
            Send
          </button>
        </div>
      </section>

    </div>
  );
}

export default App;
