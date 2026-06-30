import mongoose from 'mongoose';

const ScenarioDetailSchema = new mongoose.Schema({
  title: { type: String, required: true },
  completionProbability: { type: Number, required: true },
  stressLevel: { type: Number, required: true },
  goalSuccessRate: { type: Number, required: true },
  narrativeInsight: { type: String, required: true }
}, { _id: false });

const FutureSimulationSchema = new mongoose.Schema({
  scenario: {
    scenarioA: { type: ScenarioDetailSchema, required: true },
    scenarioB: { type: ScenarioDetailSchema, required: true },
    scenarioC: { type: ScenarioDetailSchema, required: true },
    scenarioD: { type: ScenarioDetailSchema, required: true }
  },
  recommendation: {
    type: String,
    default: ''
  },
  completionProbability: {
    type: Number,
    default: 50
  },
  generatedAt: {
    type: Date,
    default: Date.now
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

export default mongoose.model('FutureSimulation', FutureSimulationSchema);
