import express from 'express';
import {
    getMeetingMemberById,
    updateMeetingMember,
    markAttendance,
    removeMeetingMember
} from '../controllers/meetingMemberController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All meeting member routes require authentication
router.use(protect);

// Individual meeting member routes
router.route('/:id')
    .get(getMeetingMemberById)
    .put(authorize('Admin', 'Convener', 'Staff'), updateMeetingMember)
    .delete(authorize('Admin', 'Convener', 'Staff'), removeMeetingMember);

router.put('/:id/attendance', authorize('Admin', 'Convener', 'Staff'), markAttendance);

export default router;
