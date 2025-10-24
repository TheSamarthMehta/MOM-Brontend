import express from 'express';
import {
    getAllMeetingTypes,
    getMeetingTypeById,
    createMeetingType,
    updateMeetingType,
    deleteMeetingType
} from '../controllers/meetingTypeController.js';

const router = express.Router();

// Meeting Type routes
router.route('/')
    .get(getAllMeetingTypes)
    .post(createMeetingType);

router.route('/:id')
    .get(getMeetingTypeById)
    .put(updateMeetingType)
    .delete(deleteMeetingType);

export default router;
