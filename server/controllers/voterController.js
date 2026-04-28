import bcrypt from 'bcryptjs';
import { v4 as uuidv4 } from 'uuid';
import Election from '../models/Election.js';
import Candidate from '../models/Candidate.js';
import Vote from '../models/Vote.js';
import User from '../models/User.js';
import { isValidObjectId, sanitizeString } from '../utils/validate.js';

/**
 * @desc Get active elections
 * @route GET /api/voter/elections
 */
export const getActiveElections = async (req, res) => {
  try {
    const elections = await Election.find({ status: 'active' }).populate('candidates');
    res.json(elections);
  } catch (error) {
    console.error('Get active elections error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Cast vote
 * @route POST /api/voter/vote
 */
export const castVote = async (req, res) => {
  try {
    const { electionId, candidateId } = req.body;

    if (!isValidObjectId(electionId) || !isValidObjectId(candidateId)) {
      return res.status(400).json({ message: 'Invalid election or candidate ID' });
    }

    const voter = req.user;

    const election = await Election.findById(electionId);
    if (!election || election.status !== 'active') {
      return res.status(400).json({ message: 'Election is not active' });
    }

    const alreadyVoted = voter.hasVoted.some(v => v.electionId.toString() === electionId);
    if (alreadyVoted) {
      return res.status(400).json({ message: 'You have already voted in this election' });
    }

    const hashedVoterId = await bcrypt.hash(voter._id.toString(), 10);
    const receiptCode = uuidv4();

    await Vote.create({ voterId: hashedVoterId, electionId, candidateId, receiptCode });

    await Election.findByIdAndUpdate(electionId, { $inc: { totalVotes: 1 } });
    await Candidate.findByIdAndUpdate(candidateId, { $inc: { voteCount: 1 } });

    await User.findByIdAndUpdate(voter._id, { $push: { hasVoted: { electionId } } });

    req.io?.emit('voteUpdate', { electionId });

    res.json({ message: 'Vote cast successfully', receiptCode });
  } catch (error) {
    console.error('Cast vote error:', error.message);
    res.status(500).json({ message: 'Server error while casting vote' });
  }
};

/**
 * @desc Get vote receipt
 * @route GET /api/voter/receipt/:code
 */
export const getReceipt = async (req, res) => {
  try {
    const vote = await Vote.findOne({ receiptCode: req.params.code })
      .populate('electionId', 'title')
      .populate('candidateId', 'name party');

    if (!vote) return res.status(404).json({ message: 'Receipt not found' });
    res.json(vote);
  } catch (error) {
    console.error('Get receipt error:', error.message);
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Get voter profile
 * @route GET /api/voter/profile
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password -otp -otpExpiry');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};

/**
 * @desc Update voter profile
 * @route PUT /api/voter/profile
 */
export const updateProfile = async (req, res) => {
  try {
    const name = sanitizeString(req.body.name);
    const phone = sanitizeString(req.body.phone);
    if (!name) return res.status(400).json({ message: 'Name is required' });
    const updateData = { name };
    if (phone !== undefined) updateData.phone = phone;
    const user = await User.findByIdAndUpdate(
      req.user._id,
      updateData,
      { new: true }
    ).select('-password -otp -otpExpiry');
    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
};
