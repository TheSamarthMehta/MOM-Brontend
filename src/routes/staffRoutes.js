import express from 'express';
import {
    getAllStaff,
    getStaffById,
    createStaff,
    updateStaff,
    deleteStaff,
    getStaffMeetings
} from '../controllers/staffController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All staff routes require authentication
router.use(protect);

// Staff routes
router.route('/')
    .get(getAllStaff)
    .post(authorize('Admin', 'Staff'), createStaff);

router.route('/:id')
    .get(getStaffById)
    .put(authorize('Admin', 'Staff'), updateStaff)
    .delete(authorize('Admin'), deleteStaff);

router.route('/:id/meetings')
    .get(getStaffMeetings);

export default router;
