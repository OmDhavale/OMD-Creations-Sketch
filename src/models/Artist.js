import mongoose from 'mongoose';

const ArtistSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  upiId: { type: String, required: true },
  studioName: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.models.Artist || mongoose.model('Artist', ArtistSchema);
