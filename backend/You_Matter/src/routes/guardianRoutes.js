import express from 'express';
import {
  createGuardian,
  getGuardians,
  getGuardianById,
  updateGuardian,
  deleteGuardian,
  verifyGuardianEmail,
} from '../controllers/guardianController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const router = express.Router();

// Public Token Verification Endpoint
router.get('/guardians/verify', verifyGuardianEmail);

// Authenticated Guardian Endpoints
router.use('/guardians', requireAuth);

router.post('/guardians', createGuardian);
router.get('/guardians', getGuardians);
router.get('/guardians/:id', getGuardianById);
router.patch('/guardians/:id', updateGuardian);
router.delete('/guardians/:id', deleteGuardian);

export default router;
