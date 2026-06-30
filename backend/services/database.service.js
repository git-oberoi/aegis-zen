import mongoose from 'mongoose';
import { databaseConfig } from '../config/database.js';

export const connectDB = async () => {
  const connUri = databaseConfig.uri;
  if (!connUri) {
    console.warn('\n⚠️  MONGODB_URI not provided in environment variables. Running in memory-only/stateless mode.');
    return null;
  }

  const startTime = Date.now();

  try {
    const conn = await mongoose.connect(connUri, databaseConfig.options);
    const duration = Date.now() - startTime;
    console.log(`\n🔋 Connected to MongoDB`);
    console.log(`   Database Name: ${conn.connection.name}`);
    console.log(`   Connection Time: ${duration}ms`);
    console.log(`   Timestamp: ${new Date().toISOString()}\n`);
    return conn;
  } catch (error) {
    console.error(`\n❌ MongoDB Connection Error: ${error.message}`);
    return null;
  }
};

export const disconnectDB = async () => {
  if (mongoose.connection.readyState !== 0) {
    const name = mongoose.connection.name;
    await mongoose.connection.close();
    console.log(`\n🛑 Disconnected from MongoDB database: ${name} (Graceful Shutdown)\n`);
  }
};

// Handle process termination events for graceful DB connection shutdowns
process.on('SIGINT', async () => {
  await disconnectDB();
  process.exit(0);
});

process.on('SIGTERM', async () => {
  await disconnectDB();
  process.exit(0);
});
