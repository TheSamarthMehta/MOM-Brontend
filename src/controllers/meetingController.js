import Meeting from '../models/Meeting.js';
import MeetingMember from '../models/MeetingMember.js';
import MeetingDocument from '../models/MeetingDocument.js';

// @desc    Get all meetings
// @route   GET /api/meetings
// @access  Private
export const getAllMeetings = async (req, res) => {
    try {
        const { 
            page = 1, 
            limit = 10, 
            search = '', 
            status = '', 
            meetingTypeId = '',
            startDate = '',
            endDate = ''
        } = req.query;
        
        let query = {};

        // Search by title or description
        if (search) {
            query.$or = [
                { meetingTitle: { $regex: search, $options: 'i' } },
                { meetingDescription: { $regex: search, $options: 'i' } }
            ];
        }

        // Filter by status
        if (status) {
            query.status = status;
        }

        // Filter by meeting type
        if (meetingTypeId) {
            query.meetingTypeId = meetingTypeId;
        }

        // Filter by date range
        if (startDate || endDate) {
            query.meetingDate = {};
            if (startDate) query.meetingDate.$gte = new Date(startDate);
            if (endDate) query.meetingDate.$lte = new Date(endDate);
        }

        const meetings = await Meeting.find(query)
            .populate('meetingTypeId', 'meetingTypeName')
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ meetingDate: -1 });

        const count = await Meeting.countDocuments(query);

        res.status(200).json({
            success: true,
            data: meetings,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meetings',
            error: error.message
        });
    }
};

// @desc    Get single meeting by ID
// @route   GET /api/meetings/:id
// @access  Private
export const getMeetingById = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id)
            .populate('meetingTypeId', 'meetingTypeName remarks')
            .populate({
                path: 'members',
                populate: { path: 'staffId', select: 'staffName emailAddress mobileNo' }
            })
            .populate({
                path: 'documents',
                options: { sort: { sequence: 1 } }
            });

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            data: meeting
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting',
            error: error.message
        });
    }
};

// @desc    Create new meeting
// @route   POST /api/meetings
// @access  Private
export const createMeeting = async (req, res) => {
    try {
        const {
            meetingDate,
            meetingTime,
            meetingTypeId,
            meetingTitle,
            meetingDescription,
            documentPath,
            remarks
        } = req.body;

        const meeting = await Meeting.create({
            meetingDate,
            meetingTime,
            meetingTypeId,
            meetingTitle,
            meetingDescription,
            documentPath,
            remarks,
            status: 'Scheduled'
        });

        const populatedMeeting = await Meeting.findById(meeting._id)
            .populate('meetingTypeId', 'meetingTypeName');

        res.status(201).json({
            success: true,
            message: 'Meeting created successfully',
            data: populatedMeeting
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating meeting',
            error: error.message
        });
    }
};

// @desc    Update meeting
// @route   PUT /api/meetings/:id
// @access  Private
export const updateMeeting = async (req, res) => {
    try {
        const {
            meetingDate,
            meetingTime,
            meetingTypeId,
            meetingTitle,
            meetingDescription,
            documentPath,
            remarks,
            status
        } = req.body;

        const meeting = await Meeting.findByIdAndUpdate(
            req.params.id,
            {
                meetingDate,
                meetingTime,
                meetingTypeId,
                meetingTitle,
                meetingDescription,
                documentPath,
                remarks,
                status
            },
            { new: true, runValidators: true }
        ).populate('meetingTypeId', 'meetingTypeName');

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Meeting updated successfully',
            data: meeting
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating meeting',
            error: error.message
        });
    }
};

// @desc    Cancel meeting
// @route   PUT /api/meetings/:id/cancel
// @access  Private
export const cancelMeeting = async (req, res) => {
    try {
        const { cancellationReason } = req.body;

        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        if (meeting.status === 'Cancelled') {
            return res.status(400).json({
                success: false,
                message: 'Meeting is already cancelled'
            });
        }

        if (meeting.status === 'Completed') {
            return res.status(400).json({
                success: false,
                message: 'Cannot cancel a completed meeting'
            });
        }

        await meeting.cancelMeeting(cancellationReason);

        res.status(200).json({
            success: true,
            message: 'Meeting cancelled successfully',
            data: meeting
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error cancelling meeting',
            error: error.message
        });
    }
};

// @desc    Delete meeting
// @route   DELETE /api/meetings/:id
// @access  Private/Admin
export const deleteMeeting = async (req, res) => {
    try {
        const meeting = await Meeting.findById(req.params.id);

        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Delete associated members and documents
        await MeetingMember.deleteMany({ meetingId: req.params.id });
        await MeetingDocument.deleteMany({ meetingId: req.params.id });
        
        // Delete the meeting
        await meeting.deleteOne();

        res.status(200).json({
            success: true,
            message: 'Meeting and associated data deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting meeting',
            error: error.message
        });
    }
};

// @desc    Get meeting statistics
// @route   GET /api/meetings/stats
// @access  Private
export const getMeetingStats = async (req, res) => {
    try {
        const total = await Meeting.countDocuments();
        const scheduled = await Meeting.countDocuments({ status: 'Scheduled' });
        const ongoing = await Meeting.countDocuments({ status: 'Ongoing' });
        const completed = await Meeting.countDocuments({ status: 'Completed' });
        const cancelled = await Meeting.countDocuments({ status: 'Cancelled' });

        // Upcoming meetings (scheduled for future dates)
        const upcoming = await Meeting.countDocuments({
            status: 'Scheduled',
            meetingDate: { $gte: new Date() }
        });

        res.status(200).json({
            success: true,
            data: {
                total,
                scheduled,
                ongoing,
                completed,
                cancelled,
                upcoming
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting statistics',
            error: error.message
        });
    }
};

// @desc    Get upcoming meetings
// @route   GET /api/meetings/upcoming
// @access  Private
export const getUpcomingMeetings = async (req, res) => {
    try {
        const { limit = 5 } = req.query;

        const meetings = await Meeting.find({
            status: 'Scheduled',
            meetingDate: { $gte: new Date() }
        })
            .populate('meetingTypeId', 'meetingTypeName')
            .sort({ meetingDate: 1, meetingTime: 1 })
            .limit(limit * 1);

        res.status(200).json({
            success: true,
            data: meetings,
            total: meetings.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching upcoming meetings',
            error: error.message
        });
    }
};
