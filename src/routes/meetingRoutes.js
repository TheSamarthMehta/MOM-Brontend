import express from 'express';
import {
    getAllMeetings,
    getMeetingById,
    createMeeting,
    updateMeeting,
    cancelMeeting,
    deleteMeeting,
    getMeetingStats,
    getUpcomingMeetings
} from '../controllers/meetingController.js';
import {
    getMeetingMembers,
    addMeetingMember,
    addMultipleMeetingMembers,
    getMeetingAttendance
} from '../controllers/meetingMemberController.js';
import {
    getMeetingDocuments,
    addMeetingDocument,
    reorderDocuments,
    getDocumentStats
} from '../controllers/meetingDocumentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All meeting routes require authentication
router.use(protect);

// Meeting statistics and special routes
router.get('/stats', getMeetingStats);
router.get('/upcoming', getUpcomingMeetings);

// Main meeting routes
router.route('/')
    .get(getAllMeetings)
    .post(authorize('Admin', 'Convener', 'Staff'), createMeeting);

router.route('/:id')
    .get(getMeetingById)
    .put(authorize('Admin', 'Convener', 'Staff'), updateMeeting)
    .delete(authorize('Admin'), deleteMeeting);

router.put('/:id/cancel', authorize('Admin', 'Convener', 'Staff'), cancelMeeting);

// Meeting members routes
router.route('/:meetingId/members')
    .get(getMeetingMembers)
    .post(authorize('Admin', 'Convener', 'Staff'), addMeetingMember);

router.post('/:meetingId/members/bulk', authorize('Admin', 'Convener', 'Staff'), addMultipleMeetingMembers);
router.get('/:meetingId/attendance', getMeetingAttendance);

// Meeting documents routes
router.route('/:meetingId/documents')
    .get(getMeetingDocuments)
    .post(authorize('Admin', 'Convener', 'Staff'), addMeetingDocument);

router.put('/:meetingId/documents/reorder', authorize('Admin', 'Convener', 'Staff'), reorderDocuments);
router.get('/:meetingId/documents/stats', getDocumentStats);

export default router;
