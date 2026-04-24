import express from 'express';
import { getAllElections, getElectionById, getElectionResults } from '../controllers/electionController.js';

const router = express.Router();

router.get('/', getAllElections);
router.get('/:id', getElectionById);
router.get('/:id/results', getElectionResults);

export default router;
