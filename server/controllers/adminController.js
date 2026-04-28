import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import User from '../models/User.js';
import Vote from '../models/Vote.js';
import { isValidObjectId, sanitizeString } from '../utils/validate.js';

/**
 * @desc Create election
 * @route POST /api/admin/elections
 */
export const createElection = async (req, res) => {
  try {
    const title = sanitizeString(req.body.title);
    const description = sanitizeString(req.body.description);
    const { startDate, endDate } = req.body;
    if (!title) return res.status(400).json({ message: 'Title is required' });
    const election = await Election.create({
      title, description, startDate, endDate,
      createdBy: req.user._id
    });
    res.status(201).json(election);
  } catch (error) {
    console.error('Create election error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Update election
 * @route PUT /api/admin/elections/:id
 */
export const updateElection = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }
    const title = sanitizeString(req.body.title);
    const description = sanitizeString(req.body.description);
    const { startDate, endDate } = req.body;
    const status = sanitizeString(req.body.status);
    if (status && !['upcoming', 'active', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const election = await Election.findByIdAndUpdate(
      req.params.id,
      { title, description, startDate, endDate, status },
      { new: true, runValidators: true }
    );
    if (!election) return res.status(404).json({ message: 'Election not found' });
    res.json(election);
  } catch (error) {
    console.error('Update election error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Delete election
 * @route DELETE /api/admin/elections/:id
 */
export const deleteElection = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }
    await Election.findByIdAndDelete(req.params.id);
    await Candidate.deleteMany({ electionId: req.params.id });
    res.json({ message: 'Election deleted successfully' });
  } catch (error) {
    console.error('Delete election error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Add candidate to election
 * @route POST /api/admin/elections/:id/candidates
 */
export const addCandidate = async (req, res) => {
  try {
    const electionId = req.params.id;
    if (!isValidObjectId(electionId)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }
    const name = sanitizeString(req.body.name);
    const party = sanitizeString(req.body.party);
    const symbol = sanitizeString(req.body.symbol);
    const manifesto = sanitizeString(req.body.manifesto);
    const { userId } = req.body;
    if (!name || !party) return res.status(400).json({ message: 'Name and party are required' });
    if (userId && !isValidObjectId(userId)) {
      return res.status(400).json({ message: 'Invalid user ID' });
    }

    const candidate = await Candidate.create({ name, party, symbol, manifesto, electionId, userId });
    await Election.findByIdAndUpdate(electionId, { $push: { candidates: candidate._id } });

    req.io?.emit('candidateAdded', { electionId });
    res.status(201).json(candidate);
  } catch (error) {
    console.error('Add candidate error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get all voters
 * @route GET /api/admin/voters
 */
export const getAllVoters = async (req, res) => {
  try {
    const voters = await User.find({ role: 'voter' }).select('-password -otp -otpExpiry');
    res.json(voters);
  } catch (error) {
    console.error('Get voters error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Change election status
 * @route PUT /api/admin/elections/:id/status
 */
export const changeElectionStatus = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }
    const status = sanitizeString(req.body.status);
    if (!status || !['upcoming', 'active', 'ended'].includes(status)) {
      return res.status(400).json({ message: 'Invalid status value' });
    }
    const election = await Election.findByIdAndUpdate(
      req.params.id, { status }, { new: true }
    );
    if (!election) return res.status(404).json({ message: 'Election not found' });
    req.io?.emit('electionStatusChanged', { electionId: req.params.id, status });
    res.json(election);
  } catch (error) {
    console.error('Change status error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get all elections (admin)
 * @route GET /api/admin/elections
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
 * @desc Get admin dashboard stats
 * @route GET /api/admin/dashboard
 */
export const getDashboardStats = async (req, res) => {
  try {
    const totalVoters = await User.countDocuments({ role: 'voter' });
    const totalElections = await Election.countDocuments();
    const totalVotes = await Vote.countDocuments();
    const activeElections = await Election.countDocuments({ status: 'active' });
    const recentElections = await Election.find().sort({ createdAt: -1 }).limit(5).populate('candidates');

    res.json({ totalVoters, totalElections, totalVotes, activeElections, recentElections });
  } catch (error) {
    console.error('Dashboard stats error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Export election results as CSV data
 * @route GET /api/admin/elections/:id/export
 */
export const exportResults = async (req, res) => {
  try {
    if (!isValidObjectId(req.params.id)) {
      return res.status(400).json({ message: 'Invalid election ID' });
    }
    const election = await Election.findById(req.params.id).populate('candidates');
    if (!election) return res.status(404).json({ message: 'Election not found' });

    const csvRows = ['Candidate,Party,Votes'];
    election.candidates.forEach(c => {
      csvRows.push(`"${c.name}","${c.party}",${c.voteCount}`);
    });

    const csv = csvRows.join('\n');
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', `attachment; filename=results-${req.params.id}.csv`);
    res.send(csv);
  } catch (error) {
    console.error('Export results error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};
