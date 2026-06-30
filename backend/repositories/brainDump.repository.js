import BrainDump from '../models/BrainDump.js';

export const create = async (brainDumpData) => {
  return await BrainDump.create(brainDumpData);
};

export const findAllByUserId = async (userId) => {
  return await BrainDump.find({ userId }).sort({ createdAt: -1 });
};
