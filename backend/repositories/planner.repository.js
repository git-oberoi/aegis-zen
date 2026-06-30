import Planner from '../models/Planner.js';

export const findByDateAndUser = async (userId, date) => {
  const startOfDay = new Date(date);
  startOfDay.setUTCHours(0, 0, 0, 0);

  const endOfDay = new Date(date);
  endOfDay.setUTCHours(23, 59, 59, 999);

  return await Planner.findOne({
    userId,
    date: { $gte: startOfDay, $lte: endOfDay }
  });
};

export const savePlanner = async (userId, { date, tasks, focusScore }) => {
  const plannerDate = new Date(date);
  plannerDate.setUTCHours(0, 0, 0, 0);

  return await Planner.findOneAndUpdate(
    { userId, date: plannerDate },
    {
      $set: {
        tasks,
        focusScore: focusScore || 0
      }
    },
    { new: true, upsert: true }
  );
};
