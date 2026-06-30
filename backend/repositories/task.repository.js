import Task from '../models/Task.js';

export const findAllByUserId = async (userId) => {
  return await Task.find({ userId });
};

export const syncTasks = async (userId, tasksData) => {
  // Overwrite existing user tasks to reflect the client-side state synchronization
  await Task.deleteMany({ userId });

  if (!tasksData || !Array.isArray(tasksData) || tasksData.length === 0) {
    return [];
  }

  const tasksToInsert = tasksData.map((t) => ({
    title: t.title,
    description: t.description || '',
    priority: t.priority || 'medium',
    status: t.status || 'todo',
    estimatedMinutes: t.duration || t.estimatedMinutes || 30,
    deadline: t.dueDate ? new Date(t.dueDate) : new Date(),
    tags: t.category ? [t.category] : (t.tags || []),
    cognitiveLoad: t.cognitiveLoad || 3,
    subtasks: t.subtasks || [],
    userId
  }));

  return await Task.insertMany(tasksToInsert);
};
