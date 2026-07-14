import mongoose from 'mongoose';

const PaymentSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true },
  type: { type: String, enum: ['advance', 'final'], required: true },
  paymentMode: { type: String, enum: ['upi', 'cash', 'cheque'], default: 'upi' },
  screenshotUrl: { type: String, required: false },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  uploadedAt: { type: Date, default: Date.now },
});

// Force refresh if schema is old (prevents 500 errors in dev)
if (mongoose.models.Payment && !mongoose.models.Payment.schema.paths.paymentMode) {
  delete mongoose.models.Payment;
}

export default mongoose.models.Payment || mongoose.model('Payment', PaymentSchema);
