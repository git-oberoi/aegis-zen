import Habit from '../models/Habit.js';

export const findAllByUserId = async (userId) => {
  return await Habit.find({ userId });
};

export const syncHabits = async (userId, habitsData) => {
  // Clear older habits to synchronize with local storage state
  await Habit.deleteMany({ userId });

  if (!habitsData || !Array.isArray(habitsData) || habitsData.length === 0) {
    return [];
  }

  const habitsToInsert = habitsData.map((h) => ({
    title: h.title,
    frequency: h.frequency || 'daily',
    streak: h.streak || 0,
    completedDates: h.history ? h.history.map((d) => new Date(d)) : (h.completedDates || []),
    userId
  }));

  return await Habit.insertMany(habitsToInsert);
};
