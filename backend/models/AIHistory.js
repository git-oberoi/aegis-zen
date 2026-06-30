import mongoose from 'mongoose';

const AIHistorySchema = new mongoose.Schema({
  feature: {
    type: String,
    required: [true, 'AI feature category is required'],
    trim: true,
    index: true
  },
  prompt: {
    type: String,
    required: [true, 'AI compiled prompt is required']
  },
  response: {
    type: mongoose.Schema.Types.Mixed,
    required: [true, 'AI response payload is required']
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

export default mongoose.model('AIHistory', AIHistorySchema);
