import mongoose from 'mongoose';

const RevisionRequestSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.RevisionRequest || mongoose.model('RevisionRequest', RevisionRequestSchema);
