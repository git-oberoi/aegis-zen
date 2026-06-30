import mongoose from 'mongoose';

const SubtaskSchema = new mongoose.Schema({
  id: { type: String, required: true },
  title: { type: String, required: true },
  completed: { type: Boolean, default: false }
});

const TaskSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Task title is required'],
    trim: true
  },
  description: {
    type: String,
    default: ''
  },
  priority: {
    type: String,
    enum: ['high', 'medium', 'low'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['todo', 'in_progress', 'completed'],
    default: 'todo'
  },
  estimatedMinutes: {
    type: Number,
    default: 30
  },
  deadline: {
    type: Date,
    required: [true, 'Task deadline date is required']
  },
  tags: [{
    type: String,
    trim: true
  }],
  // Retaining V1 properties for roundtrip dashboard compatibility
  cognitiveLoad: {
    type: Number,
    min: 1,
    max: 5,
    default: 3
  },
  subtasks: [SubtaskSchema],
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID reference is required'],
    index: true
  }
}, {
  timestamps: true
});

export default mongoose.model('Task', TaskSchema);
