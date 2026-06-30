# 🗄️ Aegis Zen Data Architecture & Persistence

Aegis Zen adopts a client-side local storage paradigm with a stateless backend execution engine. Rather than querying a central persistent database, the application persists the user's workspace directly inside their browser context. This guarantees absolute data privacy, low latency, and offline accessibility.

---

## Storage Layer

All persistence operations utilize the browser's native **`localStorage`** API. 

```
                                  ┌──────────────────────────┐
                                  │      Browser Window      │
                                  └────────────┬─────────────┘
                                               │
                       ┌───────────────────────┴───────────────────────┐
                       │                                               │
            ┌──────────▼──────────┐                         ┌──────────▼──────────┐
            │      Demo Mode      │                         │      User Mode      │
            └──────────┬──────────┘                         └──────────┬──────────┘
                       │                                               │
  ┌────────────────────┴────────────────────┐     ┌────────────────────┴────────────────────┐
  │ Reads: 'demo_tasks', 'demo_events', etc.│     │ Reads: 'user_tasks', 'user_events', etc.│
  │ Resets: Clear/Reload demo presets       │     │ Modifies: Personal tasks and schedules  │
  └─────────────────────────────────────────┘     └─────────────────────────────────────────┘
```

### Active Storage Keys
- `aegis_demo_mode`: Boolean string (`"true"` / `"false"`). Determines whether the active UI loads preloaded sandbox data or custom user-onboarded data.
- `aegis_user_exists`: Boolean string. Set to `"true"` once the user completes the onboarding layout.
- `aegis_onboarded`: Boolean string. Evaluates if the onboarding walkthrough flow is fully finished.
- `vibe_gemini_key`: Stores the user's private Google AI Studio Gemini API Key.
- `user_username`: Custon username string (default: `"Focus Planner"`).
- `user_tasks` / `demo_tasks`: Serialized JSON array containing tasks and subtasks.
- `user_events` / `demo_events`: Serialized JSON array containing calendar timeline bookings.
- `user_habits` / `demo_habits`: Serialized JSON array containing recurring mindfulness habits and their check-in history.

---

## Data Models

### 1. Task (`Task`)
Represents a discrete unit of work with a subjective energy weighting.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique task identifier (e.g. `task_demo_1` or auto-generated UUID). |
| `title` | `string` | Task title/description. |
| `priority` | `enum` | Task urgency constraint: `"high"`, `"medium"`, `"low"`. |
| `category` | `string` | Organization label: e.g. `"Work"`, `"Study"`, `"Personal"`, `"Health"`. |
| `dueDate` | `string` | Calendar target in `YYYY-MM-DD` format. |
| `duration` | `number` | Estimated duration in minutes. |
| `status` | `enum` | Lifecycle state: `"todo"`, `"in_progress"`, `"completed"`. |
| `cognitiveLoad`| `number` | Energy rating (1 = easy/mindless, 3 = moderate, 5 = intense deep work). |
| `subtasks` | `Array` | List of dependent nested checkboxes. |

#### Subtask Structure
- `id`: `string`
- `title`: `string`
- `completed`: `boolean`

#### JSON Example
```json
{
  "id": "task_demo_1",
  "title": "Finish Aegis Zen landing page redesign",
  "priority": "high",
  "category": "Work",
  "dueDate": "2026-06-30",
  "duration": 60,
  "status": "in_progress",
  "cognitiveLoad": 4,
  "subtasks": [
    { "id": "sub_demo_1_1", "title": "Verify responsive CSS grid layout", "completed": true },
    { "id": "sub_demo_1_2", "title": "Integrate the Explore Demo mode state flow", "completed": false }
  ]
}
```

---

### 2. Calendar Event (`Event`)
Represents an allocated time-boxed block of the user's day.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique event identifier. |
| `taskId` | `string` | *(Optional)* The ID of the task associated with this calendar block. |
| `title` | `string` | Display label inside the daily schedule grid. |
| `startTime`| `string` | ISO 8601 start time stamp (e.g., `YYYY-MM-DDT14:00:00`). |
| `duration` | `number` | Duration of the calendar block in minutes. |

#### JSON Example
```json
{
  "id": "event_demo_1",
  "taskId": "task_demo_1",
  "title": "Aegis Zen Landing Page Redesign",
  "startTime": "2026-06-30T14:00:00",
  "duration": 60
}
```

---

### 3. Habit (`Habit`)
Represents recurring routines designed to improve long-term mental balance.

| Property | Type | Description |
| :--- | :--- | :--- |
| `id` | `string` | Unique habit identifier. |
| `title` | `string` | Habit name (e.g. `"1-min Breathing Break"`). |
| `streak` | `number` | Consecutive daily completions score. |
| `history` | `Array<string>`| Array of completed dates in `YYYY-MM-DD` format. |

#### JSON Example
```json
{
  "id": "h_demo_1",
  "title": "1-min Breathing Break",
  "streak": 8,
  "history": ["2026-06-29"]
}
```

---

## Dynamic Date Realignment

Because the demo environment depends on calendar scheduling relative to "today", Aegis Zen runs a **dynamic date alignment** routine on application boot. 
When loading mock datasets (`DEMO_TASKS`, `DEMO_EVENTS`):
1. The app parses current dates.
2. It shifts tasks targeting today to the current year/month/day.
3. It shifts tomorrow's task target to standard `Date.now() + 86,400,000` (next day string).
4. Calendar timestamps are split at `T` and combined with the current date string (e.g., `2026-06-30T14:00:00` shifts dynamically to the active date).

This ensures calendar events do not fall in the past, allowing the scheduling/recovery widgets to remain realistic.

---

## Backend In-Memory Cache

Although the server is stateless, the daily briefing uses a simple memory caching dictionary to reduce redundant Gemini API requests:

// Located in backend/utils/cache.utils.js
export const briefingCache = {};
```

The cache key matches `briefing_${selectedDate}_${username}`. If a user queries their morning briefing multiple times on the same date, the cache returns the previous generation, conserving API tokens and optimizing server response latency. The cache is cleared automatically when the server container reboots.

---

## MongoDB Atlas Integration (V2.0 Preparation)

In preparing Aegis Zen for production scale, we introduced a Mongoose ODM layer and three structured DB models that align directly with the localStorage data structures.

### Database Connection Layer

The database connection is defined in [db.js](file:///run/media/oberoi/New%20Volume/Study/Projects/aegis-zen/backend/config/db.js). It initializes the connection on application startup in [server.js](file:///run/media/oberoi/New%20Volume/Study/Projects/aegis-zen/backend/server.js).

If `MONGODB_URI` is omitted from the environment variables, the system logs a fallback notice and operates in a memory-only/stateless mode:

```javascript
import mongoose from 'mongoose';

export const connectDB = async () => {
  const connUri = process.env.MONGODB_URI;
  if (!connUri) {
    console.warn('\n⚠️  MONGODB_URI not provided. Running in memory-only/stateless mode.');
    return null;
  }
  // ...
};
```

### Collection Schemas

We declared Mongoose models inside the `models/` directory:

1. **[Task Model](file:///run/media/oberoi/New%20Volume/Study/Projects/aegis-zen/backend/models/Task.js)**: Holds the user's tasks, priority levels, categories, subtask structures, and cognitive load indexes.
2. **[Event Model](file:///run/media/oberoi/New%20Volume/Study/Projects/aegis-zen/backend/models/Event.js)**: Persists calendar box-scheduled items, referencing the task ID when applicable.
3. **[Habit Model](file:///run/media/oberoi/New%20Volume/Study/Projects/aegis-zen/backend/models/Habit.js)**: Stores user mindfulness habit streaks and history logs.

All collections support basic user partitioning using a `username` string default property to facilitate stateless workspaces until full user authentication is implemented.

