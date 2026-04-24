import mongoose from 'mongoose';

const candidateSchema = new mongoose.Schema({
  name: { type: String, required: true },
  party: { type: String, required: true },
  symbol: { type: String, default: '🗳️' },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  voteCount: { type: Number, default: 0 },
  manifesto: { type: String }
}, { timestamps: true });

const Candidate = mongoose.model('Candidate', candidateSchema);
export default Candidate;
