import express from 'express';
import {
  getAllCamps,
  getCampById,
  createCamp,
  updateCamp
} from '../controllers/campController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/', getAllCamps);
router.get('/:id', getCampById);
router.post('/', protect, authorize('admin', 'superadmin'), createCamp);
router.put('/:id', protect, authorize('admin', 'superadmin'), updateCamp);

export default router;
