import mongoose from 'mongoose';

const ProjectSchema = new mongoose.Schema({
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: 'Artist', required: true },
  mandalName: { type: String, required: true },
  contactPerson: { type: String, required: true },
  phone: { type: String, required: true },
  year: { type: String, required: true },
  theme: { type: String, required: true },
  conceptText: { type: String, default: '' },
  status: {
    type: String,
    enum: ['concept', 'awaiting_advance', 'sketch_preview', 'awaiting_final_payment', 'completed'],
    default: 'concept'
  },
  concepts: [{
    title: String,
    description: String,
    selected: { type: Boolean, default: false }
  }],
  totalAmount: { type: Number, default: 0 },
  advanceAmount: { type: Number, default: 0 },
  advanceWaived: { type: Boolean, default: false },
  revisionLimit: { type: Number, default: 3 },
  revisionsUsed: { type: Number, default: 0 },
  projectToken: { type: String, required: true, unique: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Project || mongoose.model('Project', ProjectSchema);
