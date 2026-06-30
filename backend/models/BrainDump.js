import mongoose from 'mongoose';

const ExtractedTaskSchema = new mongoose.Schema({
  title: { type: String, required: true },
  priority: { type: String, enum: ['high', 'medium', 'low'], default: 'medium' },
  category: { type: String, default: 'Work' },
  dueDate: { type: String, required: true },
  duration: { type: Number, default: 30 },
  cognitiveLoad: { type: Number, default: 3 }
}, { _id: false });

const ExtractedGoalSchema = new mongoose.Schema({
  title: { type: String, required: true },
  category: { type: String, default: 'Work' }
}, { _id: false });

const ExtractedDeadlineSchema = new mongoose.Schema({
  title: { type: String, required: true },
  date: { type: String, required: true }
}, { _id: false });

const BrainDumpSchema = new mongoose.Schema({
  rawInput: {
    type: String,
    required: [true, 'Raw input text is required'],
    trim: true
  },
  extractedTasks: [ExtractedTaskSchema],
  extractedGoals: [ExtractedGoalSchema],
  extractedDeadlines: [ExtractedDeadlineSchema],
  aiSummary: {
    type: String,
    default: ''
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

export default mongoose.model('BrainDump', BrainDumpSchema);
