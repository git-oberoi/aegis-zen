import AIHistory from '../models/AIHistory.js';

export const create = async (historyData) => {
  return await AIHistory.create(historyData);
};

export const findAllByUserId = async (userId) => {
  return await AIHistory.find({ userId }).sort({ createdAt: -1 });
};
