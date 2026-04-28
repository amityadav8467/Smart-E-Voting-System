import express from 'express';
import { getActiveElections, castVote, getReceipt, getProfile, updateProfile } from '../controllers/voterController.js';
import { protect } from '../middleware/authMiddleware.js';
import { authorize } from '../middleware/roleMiddleware.js';
import rateLimit from 'express-rate-limit';

const router = express.Router();

const voteLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 20,
  message: { message: 'Too many vote attempts, please try again later' }
});

router.use(protect);
router.use(authorize('voter', 'admin'));

router.get('/elections', getActiveElections);
router.post('/vote', voteLimiter, castVote);
router.get('/receipt/:code', getReceipt);
router.get('/profile', getProfile);
router.put('/profile', updateProfile);

export default router;
