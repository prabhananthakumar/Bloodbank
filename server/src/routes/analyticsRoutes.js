import express from 'express';
import { getDashboardMetrics, checkCompatibility } from '../controllers/analyticsController.js';

const router = express.Router();

router.get('/dashboard', getDashboardMetrics);
router.post('/check-compatibility', checkCompatibility);

export default router;
