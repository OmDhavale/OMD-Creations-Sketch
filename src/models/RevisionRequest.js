import mongoose from 'mongoose';

const RevisionRequestSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  message: { type: String, required: true },
  type: { 
    type: String, 
    enum: ['none', 'small', 'medium', 'large', 'xl', 'xxl'], 
    default: 'none' 
  },
  isPaid: { type: Boolean, default: false },
  amount: { type: Number, default: 0 },
  paymentStatus: { 
    type: String, 
    enum: ['none', 'pending_payment', 'pending_approval', 'approved', 'rejected'], 
    default: 'none' 
  },
  paymentMode: { type: String, enum: ['upi', 'cash', 'cheque'] },
  screenshotUrl: { type: String },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.RevisionRequest || mongoose.model('RevisionRequest', RevisionRequestSchema);
