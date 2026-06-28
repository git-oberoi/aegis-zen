import { GoogleGenerativeAI } from "@google/generative-ai";

// Define the system instructions for the AI Zen Productivity Coach
const SYSTEM_INSTRUCTION = `
You are "Aegis", a calm, mindful, and grounding AI Productivity Companion and Zen Master.
Your core goal is to help the user manage their tasks, balance their daily energy budget, and avoid burnouts, while gently keeping them on track for their deadlines.

You have access to a suite of tools to manage the user's tasks and calendar. Use them to take direct actions on behalf of the user when requested.

Behavioral Guidelines & Tone:
1. Mindful Guidance: Encourage work-life balance. Do not stress the user. Avoid urgent, alarming alarms. Instead, use gentle, grounding words (e.g., "Let's find a peaceful space for...", "A task is requesting your attention; let's flow it into a comfortable slot").
2. Energy Budgeting: Advise the user on cognitive load. A day has an energy budget of 15 cognitive load points. If tasks exceed this, warn them gently and suggest moving things around to maintain peace of mind.
3. Breathing Breaks: If the user feels overwhelmed, anxious, mentions stress, or completes an intense task (cognitive load 5), suggest taking a breath and call the 'triggerBreathingBreak' tool to start the breathing widget.
4. Voice: Serene, encouraging, clear, and slightly poetic but highly practical. Use bullet points for structural clarity.
5. Relative Time: The user's current date/time will be provided. Always use this relative reference to calculate correct days, dates, and times.
`;

// Helper to define tools
const getToolsConfig = () => {
  return {
    functionDeclarations: [
      {
        name: "addTask",
        description: "Creates and adds a new task to the user's task list. Use this whenever the user wants to add, create, note down, or remember a task.",
        parameters: {
          type: "OBJECT",
          properties: {
            title: { type: "STRING", description: "The title/description of the task (e.g. 'Finish biology report')" },
            priority: { type: "STRING", enum: ["high", "medium", "low"], description: "Priority level of the task. Defaults to medium." },
            category: { type: "STRING", description: "The category/tag of the task (e.g., Work, Personal, Health, Study, Finance)" },
            dueDate: { type: "STRING", description: "Due date in YYYY-MM-DD format. If user says 'tomorrow' or 'next Monday', calculate the date relative to the current time." },
            duration: { type: "NUMBER", description: "Estimated duration in minutes to complete the task" },
            cognitiveLoad: { type: "INTEGER", description: "Energy required for this task. 1 = Easy/Mindless, 3 = Moderate, 5 = Intense deep work. Defaults to 3." }
          },
          required: ["title"]
        }
      },
      {
        name: "scheduleTask",
        description: "Schedules an existing task onto a specific date and time slot in the calendar.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "STRING", description: "The unique ID of the task to schedule" },
            startTime: { type: "STRING", description: "ISO 8601 date-time string for when the task slot starts (e.g. '2026-06-28T14:00:00')" },
            duration: { type: "NUMBER", description: "Duration in minutes. Defaults to the task's estimated duration." }
          },
          required: ["taskId", "startTime"]
        }
      },
      {
        name: "updateTask",
        description: "Updates an existing task's status, priority, title, due date, or cognitive load.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "STRING", description: "The unique ID of the task to update" },
            title: { type: "STRING", description: "Updated title of the task" },
            status: { type: "STRING", enum: ["todo", "in_progress", "completed"], description: "The completion state of the task" },
            priority: { type: "STRING", enum: ["high", "medium", "low"] },
            category: { type: "STRING" },
            dueDate: { type: "STRING", description: "Updated due date in YYYY-MM-DD format" },
            cognitiveLoad: { type: "INTEGER", description: "Energy required (1 to 5)" }
          },
          required: ["taskId"]
        }
      },
      {
        name: "deleteTask",
        description: "Schedules deletion of a task from the user's task list.",
        parameters: {
          type: "OBJECT",
          properties: {
            taskId: { type: "STRING", description: "The unique ID of the task to delete" }
          },
          required: ["taskId"]
        }
      },
      {
        name: "listTasks",
        description: "Retrieves the list of all tasks. Use this when the user asks 'what tasks do I have?', 'show my todo list', or similar.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      },
      {
        name: "listCalendarEvents",
        description: "Retrieves all scheduled calendar events. Use this to check the user's calendar schedule.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      },
      {
        name: "triggerBreathingBreak",
        description: "Launches the calming 1-minute box-breathing guide widget in the user interface. Use this when the user says they are stressed, tired, need a break, or complete an intense task.",
        parameters: {
          type: "OBJECT",
          properties: {}
        }
      }
    ]
  };
};

export class ProductivityAgent {
  constructor(apiKey, callbacks) {
    this.apiKey = apiKey || import.meta.env.VITE_GEMINI_API_KEY;
    this.callbacks = callbacks; // Object containing: onAddTask, onScheduleTask, onUpdateTask, onDeleteTask, getTasksList, getEventsList, onTriggerBreathing
    this.chatSession = null;
    this.genAI = null;
    this.initAgent();
  }

  initAgent() {
    if (!this.apiKey) return;
    try {
      this.genAI = new GoogleGenerativeAI(this.apiKey);
      const model = this.genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_INSTRUCTION,
        tools: [getToolsConfig()]
      });

      this.chatSession = model.startChat({
        history: []
      });
    } catch (e) {
      console.error("Failed to initialize Gemini client:", e);
    }
  }

  updateApiKey(newKey) {
    this.apiKey = newKey;
    this.initAgent();
  }

  async handleUserMessage(messageText) {
    if (!this.chatSession) {
      return {
        text: "Please set your Google AI Studio API Key in the settings panel to activate the productivity companion."
      };
    }

    // Append context of current date/time to make relative calculations accurate
    const now = new Date();
    const contextPrompt = `[Context: Current Local Time is ${now.toString()}. Today is ${now.toLocaleDateString('en-US', { weekday: 'long' })}. Use this to interpret dates like "today", "tomorrow", or "next Monday" correctly.]\n\nUser Message: ${messageText}`;

    try {
      let response = await this.chatSession.sendMessage(contextPrompt);
      return await this.processAgentResponseLoop(response);
    } catch (error) {
      console.error("Error in agent chat loop:", error);
      return {
        text: `Sorry, I encountered an error: ${error.message || error}`
      };
    }
  }

  async processAgentResponseLoop(response) {
    let functionCalls = response.functionCalls;
    
    // Loop while the model wants to call functions
    while (functionCalls && functionCalls.length > 0) {
      const functionResponses = [];

      for (const call of functionCalls) {
        const { name, args } = call;
        let result = null;

        console.log(`[Agent Tool Call] Executing: ${name}`, args);

        try {
          switch (name) {
            case "addTask":
              if (this.callbacks.onAddTask) {
                result = this.callbacks.onAddTask(args);
              }
              break;
            case "scheduleTask":
              if (this.callbacks.onScheduleTask) {
                result = this.callbacks.onScheduleTask(args);
              }
              break;
            case "updateTask":
              if (this.callbacks.onUpdateTask) {
                result = this.callbacks.onUpdateTask(args);
              }
              break;
            case "deleteTask":
              if (this.callbacks.onDeleteTask) {
                result = this.callbacks.onDeleteTask(args);
              }
              break;
            case "listTasks":
              if (this.callbacks.getTasksList) {
                result = { tasks: this.callbacks.getTasksList() };
              }
              break;
            case "listCalendarEvents":
              if (this.callbacks.getEventsList) {
                result = { events: this.callbacks.getEventsList() };
              }
              break;
            case "triggerBreathingBreak":
              if (this.callbacks.onTriggerBreathing) {
                result = this.callbacks.onTriggerBreathing();
              }
              break;
            default:
              result = { error: `Tool ${name} not found.` };
          }
        } catch (err) {
          result = { error: err.message || err.toString() };
        }

        functionResponses.push({
          functionResponse: {
            name,
            response: result || { success: true }
          }
        });
      }

      console.log("[Agent Tool Response] Sending back results to Gemini:", functionResponses);
      
      // Send tool outputs back to model to get final text or further tool calls
      response = await this.chatSession.sendMessage(functionResponses);
      functionCalls = response.functionCalls;
    }

    return {
      text: response.text
    };
  }
}
