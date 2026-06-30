import 'dotenv/config';
import { connectDB, disconnectDB } from '../services/database.service.js';
import { findOrCreateDemoUser } from '../repositories/user.repository.js';
import { updateByUserId } from '../repositories/settings.repository.js';

const run = async () => {
  console.log('🌱 Seed Script: Initializing Demo User...');
  const conn = await connectDB();
  if (!conn) {
    console.error('❌ Failed to connect to MongoDB for seeding.');
    process.exit(1);
  }

  try {
    const user = await findOrCreateDemoUser();
    
    // Seed default settings configuration for this user
    await updateByUserId(user._id, {
      theme: 'dark',
      voiceEnabled: true,
      aiPersonality: 'Aegis',
      notifications: true,
      workingHours: { start: '09:00', end: '17:00' }
    });
    
    console.log(`✅ Sandbox Demo User resolved/created with ID: ${user._id}`);
  } catch (error) {
    console.error('❌ Seeding error:', error.message);
  } finally {
    await disconnectDB();
    process.exit(0);
  }
};

run();
