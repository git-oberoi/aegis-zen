import mongoose from 'mongoose';

const HabitSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Habit title is required'],
    trim: true
  },
  frequency: {
    type: String,
    enum: ['daily', 'weekly', 'custom'],
    default: 'daily'
  },
  streak: {
    type: Number,
    default: 0
  },
  completedDates: [{
    type: Date
  }],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Habit', HabitSchema);
