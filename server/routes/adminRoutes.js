import express from 'express';
import {
  createElection, updateElection, deleteElection, addCandidate,
  getAllVoters, changeElectionStatus, getDashboardStats, exportResults
} from '../controllers/adminController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/dashboard', getDashboardStats);
router.post('/elections', createElection);
router.put('/elections/:id', updateElection);
router.delete('/elections/:id', deleteElection);
router.post('/elections/:id/candidates', addCandidate);
router.put('/elections/:id/status', changeElectionStatus);
router.get('/elections/:id/export', exportResults);
router.get('/voters', getAllVoters);

export default router;
