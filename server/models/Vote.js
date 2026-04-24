import mongoose from 'mongoose';

const voteSchema = new mongoose.Schema({
  voterId: { type: String, required: true },
  electionId: { type: mongoose.Schema.Types.ObjectId, ref: 'Election', required: true },
  candidateId: { type: mongoose.Schema.Types.ObjectId, ref: 'Candidate', required: true },
  timestamp: { type: Date, default: Date.now },
  receiptCode: { type: String, required: true, unique: true }
});

const Vote = mongoose.model('Vote', voteSchema);
export default Vote;
