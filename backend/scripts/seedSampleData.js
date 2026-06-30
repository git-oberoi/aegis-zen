import 'dotenv/config';
import { connectDB, disconnectDB } from '../services/database.service.js';
import { findOrCreateDemoUser } from '../repositories/user.repository.js';
import { syncTasks } from '../repositories/task.repository.js';
import { syncHabits } from '../repositories/habit.repository.js';

const run = async () => {
  console.log('🌱 Seed Script: Initializing Sample Workspace Data...');
  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Failed to connect to MongoDB for seeding.');
    process.exit(1);
  }

  try {
    const user = await findOrCreateDemoUser();
    const userId = user._id;

    // Define standard V1 mock tasks matching demoData.js
    const sampleTasks = [
      {
        title: 'Finish Aegis Zen landing page redesign',
        priority: 'high',
        category: 'Work',
        dueDate: new Date().toISOString().split('T')[0],
        duration: 60,
        status: 'in_progress',
        cognitiveLoad: 4,
        subtasks: [
          { id: 'sub_demo_1_1', title: 'Verify responsive CSS grid layout', completed: true },
          { id: 'sub_demo_1_2', title: 'Integrate the Explore Demo mode state flow', completed: false }
        ]
      },
      {
        title: 'Review AI task suggestions & balance cognitive load',
        priority: 'high',
        category: 'Study',
        dueDate: new Date(Date.now() + 86400000).toISOString().split('T')[0], // Tomorrow
        duration: 30,
        status: 'todo',
        cognitiveLoad: 3,
        subtasks: []
      },
      {
        title: 'Practice ocean wave breathing break exercise',
        priority: 'low',
        category: 'Personal',
        dueDate: new Date().toISOString().split('T')[0],
        duration: 15,
        status: 'completed',
        cognitiveLoad: 1,
        subtasks: []
      },
      {
        title: "Plan tomorrow's focus schedule with Aegis smart planner",
        priority: 'medium',
        category: 'Work',
        dueDate: new Date().toISOString().split('T')[0],
        duration: 20,
        status: 'todo',
        cognitiveLoad: 2,
        subtasks: []
      }
    ];

    // Define standard V1 mock habits matching demoData.js
    const sampleHabits = [
      {
        title: '1-min Breathing Break',
        streak: 8,
        history: [new Date(Date.now() - 86400000).toISOString().split('T')[0]]
      },
      {
        title: 'Plan Day in Morning',
        streak: 12,
        history: [
          new Date().toISOString().split('T')[0],
          new Date(Date.now() - 86400000).toISOString().split('T')[0]
        ]
      },
      {
        title: 'Mindful Focus Block (45m)',
        streak: 5,
        history: []
      }
    ];

    const tasks = await syncTasks(userId, sampleTasks);
    console.log(`✅ Loaded ${tasks.length} sample tasks.`);

    const habits = await syncHabits(userId, sampleHabits);
    console.log(`✅ Loaded ${habits.length} sample habits.`);

    console.log('🎉 Seeding sample data complete!');
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
