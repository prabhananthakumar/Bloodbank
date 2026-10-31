import express from 'express';
import {
  createRequest,
  getMyRequests,
  getAllRequests,
  reviewRequest,
  dispatchRequest
} from '../controllers/requestController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/', protect, createRequest);
router.get('/my', protect, getMyRequests);
router.get('/', protect, authorize('admin', 'superadmin'), getAllRequests);
router.put('/:id/review', protect, authorize('admin', 'superadmin'), reviewRequest);
router.post('/:id/dispatch', protect, authorize('admin', 'superadmin'), dispatchRequest);

export default router;
