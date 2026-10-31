import express from 'express';
import {
  getInventorySummary,
  getAllUnits,
  addBloodUnit,
  updateTestingStatus,
  discardExpiredUnits
} from '../controllers/inventoryController.js';
import { protect, authorize } from '../middleware/authMiddleware.js';

const router = express.Router();

router.get('/summary', getInventorySummary);
router.get('/', protect, authorize('admin', 'superadmin'), getAllUnits);
router.post('/', protect, authorize('admin', 'superadmin'), addBloodUnit);
router.put('/:id/testing', protect, authorize('admin', 'superadmin'), updateTestingStatus);
router.post('/purge-expired', protect, authorize('admin', 'superadmin'), discardExpiredUnits);

export default router;
