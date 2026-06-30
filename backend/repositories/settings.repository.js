import Settings from '../models/Settings.js';

export const findByUserId = async (userId) => {
  return await Settings.findOne({ userId });
};

export const updateByUserId = async (userId, settingsData) => {
  return await Settings.findOneAndUpdate(
    { userId },
    { $set: settingsData },
    { new: true, upsert: true }
  );
};
