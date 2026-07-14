import mongoose from 'mongoose';

const GalleryImageSchema = new mongoose.Schema({
  imageUrl: { type: String, required: true },
  publicId: { type: String, required: true },
  title: { type: String, default: '' },
  uploadedAt: { type: Date, default: Date.now },
});

export default mongoose.models.GalleryImage || mongoose.model('GalleryImage', GalleryImageSchema);
