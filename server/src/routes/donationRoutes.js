import express from 'express';
import {
  bookAppointment,
  getMyAppointments,
  getAllAppointments,
  processDonation
} from '../controllers/donationController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/book', protect, bookAppointment);
router.get('/my', protect, getMyAppointments);
router.get('/', protect, authorize('admin', 'superadmin'), getAllAppointments);
router.post('/:id/process', protect, authorize('admin', 'superadmin'), processDonation);

export default router;
