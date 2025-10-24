import express from 'express';
import {
    getDashboardOverview,
    getMeetingAnalytics,
    getStaffPerformance,
    getMeetingTypeAnalytics,
    getRecentActivity
} from '../controllers/dashboardController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// All dashboard routes require authentication
router.use(protect);

// Dashboard routes
router.get('/overview', getDashboardOverview);
router.get('/analytics', getMeetingAnalytics);
router.get('/staff-performance', getStaffPerformance);
router.get('/meeting-types', getMeetingTypeAnalytics);
router.get('/recent-activity', getRecentActivity);

export default router;





