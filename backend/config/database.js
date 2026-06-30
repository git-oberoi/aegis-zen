import 'dotenv/config';

export const databaseConfig = {
  uri: process.env.MONGODB_URI || '',
  options: {
    maxPoolSize: 10,
    serverSelectionTimeoutMS: 5000,
    socketTimeoutMS: 45000,
  }
};
