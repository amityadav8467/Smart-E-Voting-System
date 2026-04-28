import mongoose from 'mongoose';

const electionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String },
  startDate: { type: Date, required: true },
  endDate: { type: Date, required: true },
  status: { type: String, enum: ['upcoming', 'active', 'ended'], default: 'upcoming' },
  candidates: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Candidate' }],
  totalVotes: { type: Number, default: 0 },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
}, { timestamps: true });

const Election = mongoose.model('Election', electionSchema);
export default Election;
