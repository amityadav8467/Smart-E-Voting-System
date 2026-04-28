import Candidate from '../models/Candidate.js';
import Election from '../models/Election.js';

/**
 * @desc Get elections for a candidate
 * @route GET /api/candidate/elections
 */
export const getCandidateElections = async (req, res) => {
  try {
    const candidates = await Candidate.find({ userId: req.user._id }).populate('electionId');
    res.json(candidates);
  } catch (error) {
    console.error('Get candidate elections error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
