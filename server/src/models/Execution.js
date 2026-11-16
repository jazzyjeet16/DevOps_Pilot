import mongoose from 'mongoose';

const executionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
  repository: { type: String, required: true },
  pullRequestNumber: Number,
  pullRequestTitle: String,
  pullRequestUrl: String,
  status: { type: String, enum: ['queued', 'running', 'success', 'failed'], default: 'queued', index: true },
  summary: String,
  review: String,
  changedFiles: { type: Number, default: 0 },
  error: String,
  source: { type: String, default: 'n8n' },
  startedAt: Date,
  completedAt: Date
}, { timestamps: true });

export default mongoose.model('Execution', executionSchema);
