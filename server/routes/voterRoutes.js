import express from 'express';
import { getActiveElections, castVote, getReceipt, getProfile, updateProfile } from '../controllers/voterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('voter', 'admin'));

router.get('/elections', getActiveElections);
router.post('/vote', castVote);
router.get('/receipt/:code', getReceipt);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
