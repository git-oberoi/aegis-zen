import mongoose from 'mongoose';

const WorkingHoursSchema = new mongoose.Schema({
  start: {
    type: String,
    default: '09:00'
  },
  end: {
    type: String,
    default: '17:00'
  }
}, { _id: false });

const SettingsSchema = new mongoose.Schema({
  theme: {
    type: String,
    enum: ['light', 'dark', 'system'],
    default: 'dark'
  },
  voiceEnabled: {
    type: Boolean,
    default: true
  },
  aiPersonality: {
    type: String,
    default: 'Aegis'
  },
  notifications: {
    type: Boolean,
    default: true
  },
  workingHours: {
    type: WorkingHoursSchema,
    default: () => ({})
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    unique: true,
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Settings', SettingsSchema);
