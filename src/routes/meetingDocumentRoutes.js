import express from 'express';
import {
    getDocumentById,
    updateMeetingDocument,
    deleteMeetingDocument
} from '../controllers/meetingDocumentController.js';
import { protect, authorize } from '../middleware/auth.js';

const router = express.Router();

// All meeting document routes require authentication
router.use(protect);

// Individual document routes
router.route('/:id')
    .get(getDocumentById)
    .put(authorize('Admin', 'Convener', 'Staff'), updateMeetingDocument)
    .delete(authorize('Admin', 'Convener', 'Staff'), deleteMeetingDocument);

export default router;
