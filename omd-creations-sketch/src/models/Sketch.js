import mongoose from 'mongoose';

const SketchSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  previewImageUrl: { type: String, required: true },
  hdImageUrl: { type: String, required: true },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.Sketch || mongoose.model('Sketch', SketchSchema);
