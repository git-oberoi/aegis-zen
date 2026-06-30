import FutureSimulation from '../models/FutureSimulation.js';

export const create = async (simulationData) => {
  return await FutureSimulation.create(simulationData);
};

export const findAllByUserId = async (userId) => {
  return await FutureSimulation.find({ userId }).sort({ createdAt: -1 });
};
