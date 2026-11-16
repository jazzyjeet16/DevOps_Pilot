import mongoose from 'mongoose';

const repositorySchema = new mongoose.Schema({
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  fullName: { type: String, required: true, trim: true },
  htmlUrl: String,
  defaultBranch: { type: String, default: 'main' },
  isActive: { type: Boolean, default: true }
}, { timestamps: true });
repositorySchema.index({ owner: 1, fullName: 1 }, { unique: true });
export default mongoose.model('Repository', repositorySchema);
