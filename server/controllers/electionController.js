import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';

/**
 * @desc Get all elections
 * @route GET /api/elections
 */
export const getAllElections = async (req, res) => {
  try {
    const elections = await Election.find().populate('candidates').sort({ createdAt: -1 });
    res.json(elections);
  } catch (error) {
    console.error('Get all elections error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get election by ID
 * @route GET /api/elections/:id
 */
export const getElectionById = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (error) {
    console.error('Get election by ID error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get election results
 * @route GET /api/elections/:id/results
 */
export const getElectionResults = async (req, res) => {
  try {
    const election = await Election.findById(req.params.id).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const results = election.candidates.sort((a, b) => b.voteCount - a.voteCount);
    const winner = results.length > 0 ? results[0] : null;

    res.json({ election, results, winner });
  } catch (error) {
    console.error('Get results error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
