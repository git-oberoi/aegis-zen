# 🔌 Aegis Zen REST API Documentation

Aegis Zen communicates via a set of stateless POST endpoints exposed by the Node.js/Express backend. All requests receive JSON payloads and respond with strict, structured JSON formats backed by Google Gemini AI schemas.

---

## Global Headers & Context

- **Base URL**: `http://localhost:5000/api` (Development) or relative paths (Production)
- **Headers**:
  - `Content-Type: application/json`
  - `x-gemini-key`: *(Optional)* The client's Google AI Studio Gemini API Key. If missing, the backend resolves the server's local environment `GEMINI_API_KEY`. If neither is found, the server automatically executes a heuristic rules engine fallback.

---

## Endpoints Reference

### 1. Morning Daily Briefing
Generates an ambient morning greeting summarizing recent progress, today's schedule risks, and a prioritized start recommendation.

- **URL**: `/briefing`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "habits": "Array of Habits",
    "history": "Array of strings / past dates",
    "selectedDate": "string (YYYY-MM-DD)",
    "username": "string"
  }
  ```
- **Response Schema (`BRIEFING_RESPONSE_SCHEMA`)**:
  - `greeting` (`string`): Personalized welcome line.
  - `performanceSummary` (`string`): Overview of completed vs. total tasks.
  - `todayRisk` (`string`): Identified calendar bottlenecks or heavy workloads.
  - `firstAction` (`string`): Recommended task to start the day.
  - `mindfulMessage` (`string`): Zen-infused support note.

---

### 2. Burnout Forecasting
Evaluates the task list and weekly habits to calculate a numeric burnout probability and suggest behavioral changes.

- **URL**: `/burnout`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "events": "Array of Calendar Events",
    "habits": "Array of Habits"
  }
  ```
- **Response Schema (`BURNOUT_RESPONSE_SCHEMA`)**:
  - `burnoutScore` (`integer`): Index score from 0 to 100.
  - `category` (`string`): `"Healthy"`, `"Moderate"`, `"High"`, or `"Critical"`.
  - `metricsSummary` (`object`):
    - `workloadChange` (`string`)
    - `cognitiveStress` (`string`)
    - `completionRatio` (`string`)
  - `recommendations` (`Array<string>`): Actionable interventions.
  - `trendData` (`Array<object>`):
    - `day` (`string`)
    - `score` (`integer`)
  - `mindfulExplanation` (`string`): Qualitative feedback.

---

### 3. Cognitive Load Assessment
Performs real-time cognitive workload measurement based on today's active tasks and scheduled events.

- **URL**: `/cognitive-load`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "events": "Array of Calendar Events"
  }
  ```
- **Response Schema (`COGNITIVE_LOAD_RESPONSE_SCHEMA`)**:
  - `cognitiveLoad` (`integer`): Load score from 0 to 100.
  - `level` (`string`): `"Low"`, `"Moderate"`, `"High"`, or `"Critical"`.
  - `explanation` (`string`): Rationale behind the active stress index.
  - `recommendations` (`Array<string>`): Calming breaks or scheduling interventions.

---

### 4. Chaos Brain Dump Parser
Translates highly unformatted, chaotic text dumps into structured goals, tasks, dates, and estimated cognitive weights.

- **URL**: `/braindump`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "text": "string (chaotic input text)",
    "currentDate": "string (YYYY-MM-DD)"
  }
  ```
- **Response Schema (`BRAINDUMP_RESPONSE_SCHEMA`)**:
  - `goals` (`Array<object>`): High-level targets containing `title` and `category`.
  - `tasks` (`Array<object>`): Individual tasks with `title`, `priority`, `category`, `dueDate`, `duration`, and `cognitiveLoad`.
  - `deadlines` (`Array<object>`): Looming milestones with `title` and `date`.
  - `estimatedWorkloadHours` (`number`): Cumulative focus hours.
  - `risks` (`Array<string>`): Warns about schedule congestion.

---

### 5. Structured Action Inbox
Parses a single conversational task note (e.g. "Meeting with team on Friday afternoon load 4") into a structured React state item.

- **URL**: `/inbox-action`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "text": "string",
    "currentDate": "string (YYYY-MM-DD)"
  }
  ```
- **Response Schema (`INBOX_RESPONSE_SCHEMA`)**:
  - `task` (`object`): Structured parameters (`title`, `priority`, `category`, `dueDate`, `cognitiveLoad`).
  - `subtasks` (`Array<object>`): Inferred checklists containing `title`.
  - `estimated_hours` (`number`): Predicted time.
  - `suggested_schedule` (`object`): Optional suggested start/end times.

---

### 6. Voice Accountability Check-In
Evaluates user-spoken progress statements relative to a current calendar block, returning verbal support and initiating calendar reschedule commands if behind.

- **URL**: `/voice-accountability`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "taskTitle": "string",
    "userResponse": "string"
  }
  ```
- **Response Schema (`VOICE_ACCOUNTABILITY_RESPONSE_SCHEMA`)**:
  - `coachSpeech` (`string`): The text-to-speech response for the browser agent.
  - `actionTaken` (`string`): `"reschedule"`, `"complete"`, or `"none"`.
  - `updatedStatus` (`string`): `"todo"`, `"in_progress"`, `"completed"`, or `"none"`.
  - `rescheduleDate` (`string`): *(Optional)* Calculated target date.
  - `mindfulAdvice` (`string`): Explains the wellness rationale.

---

### 7. Day Flow Planner
Creates a chronological box-scheduled timeline of alternating focus blocks and relaxation breaks.

- **URL**: `/planner`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "selectedDate": "string (YYYY-MM-DD)",
    "survivalModeActive": "boolean"
  }
  ```
- **Response Schema (`PLANNER_RESPONSE_SCHEMA`)**:
  - `schedule` (`Array<object>`): Time blocks containing `taskId` (null for breaks), `title`, `startTime`, `endTime`, `type` (`task` or `break`), and `duration`.
  - `mindfulSummary` (`string`): Narrative summary of why this schedule flow works.

---

### 8. Conflict Rescheduling
Identifies running late / overdue tasks and calendar items and generates optimal recovery suggestions (e.g. shift later today, delay to tomorrow, preserve high priority).

- **URL**: `/reschedule`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "events": "Array of Calendar Events",
    "selectedDate": "string (YYYY-MM-DD)",
    "currentTime": "string (ISO time)"
  }
  ```
- **Response Schema (`RESCHEDULE_RESPONSE_SCHEMA`)**:
  - `missedTasks` (`Array<object>`): Overdue items.
  - `recommendations` (`Array<object>`): Array containing rescheduling items: `type` (`"move"`, `"delay"`, `"preserve"`), `taskId`, `taskTitle`, `suggestionText`, and `action` (`newDueDate` and `newStartTime`).
  - `mindfulExplanation` (`string`): Zen explanation of the suggested adjustments.

---

### 9. Task Estimation
Estimates duration, complexity, and cognitive load for a given task description before it is added to the inbox.

- **URL**: `/estimate-task`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "title": "string",
    "description": "string"
  }
  ```
- **Response Schema (`ESTIMATION_RESPONSE_SCHEMA`)**:
  - `estimatedMinutes` (`integer`): Best estimation of total active focus minutes.
  - `complexity` (`string`): `"Low"`, `"Medium"`, `"High"`, or `"Critical"`.
  - `cognitiveLoad` (`integer`): 1-5 rating.
  - `confidence` (`integer`): 0-100 rating.

---

### 10. Next Best Task Recommendation
Identifies the single best task block to tackle next, customized based on the user's subjective energy level.

- **URL**: `/recommend-next`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "energyLevel": "string (e.g. 'Low', 'High')"
  }
  ```
- **Response Schema (`NEXT_RECOMMENDATION_RESPONSE_SCHEMA`)**:
  - `task` (`string`): Name of target task.
  - `reason` (`Array<string>`): Points backing this recommendation.
  - `estimatedDuration` (`integer`): Expected minutes.

---

### 11. Weekly Optimizer
Evaluates multi-day goals, tasks, and habits to formulate high-level focus, postpone, and ignore vectors for the upcoming week.

- **URL**: `/optimize-week`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "habits": "Array of Habits",
    "goals": "Array of strings / targets"
  }
  ```
- **Response Schema (`WEEKLY_OPTIMIZER_RESPONSE_SCHEMA`)**:
  - `weeklyPlanSummary` (`string`): Narrative summary.
  - `riskAssessment` (`string`): Burnout warnings.
  - `priorityChanges` (`Array<string>`): Priority adjustments.
  - `focusList` (`Array<string>`): High priority items.
  - `postponeList` (`Array<string>`): Delay targets.
  - `ignoreList` (`Array<string>`): Non-essential tasks to drops to protect health.

---

### 12. Future Self Timeline Simulation
Projects current scheduling habits and cognitive load balances into narrative 3-month forecast scenarios.

- **URL**: `/simulate`
- **Method**: `POST`
- **Payload Schema**:
  ```json
  {
    "tasks": "Array of Tasks",
    "habits": "Array of Habits"
  }
  ```
- **Response Schema (`SIMULATION_RESPONSE_SCHEMA`)**:
  - `scenarioA` / `scenarioB` / `scenarioC` / `scenarioD` (`object`): Each containing `title`, `completionProbability` (0-100), `stressLevel` (0-100), `goalSuccessRate` (0-100), and `narrativeInsight`.
  - `mindfulCoachAdvice` (`string`): Reflective coach comments.

---

### 13. System Health Check
Simple lightweight endpoint check to verify if the container backend is alive.

- **URL**: `http://localhost:5000/health`
- **Method**: `GET`
- **Payload Schema**: *None*
- **Response**:
  ```json
  {
    "status": "ok",
    "service": "Aegis Backend"
  }
  ```
