import mongoose from 'mongoose';

const ScheduleBlockSchema = new mongoose.Schema({
  taskId: {
    type: String,
    default: null
  },
  title: {
    type: String,
    required: true
  },
  startTime: {
    type: String,
    required: true
  },
  endTime: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['task', 'break'],
    required: true
  },
  duration: {
    type: Number,
    required: true
  }
}, { _id: false });

const PlannerSchema = new mongoose.Schema({
  date: {
    type: Date,
    required: [true, 'Planner date is required'],
    index: true
  },
  tasks: [ScheduleBlockSchema],
  focusScore: {
    type: Number,
    default: 0
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Planner', PlannerSchema);
