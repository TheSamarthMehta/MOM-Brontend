import MeetingMember from '../models/MeetingMember.js';
import Meeting from '../models/Meeting.js';
import Staff from '../models/Staff.js';

// @desc    Get all members for a meeting
// @route   GET /api/meetings/:meetingId/members
// @access  Private
export const getMeetingMembers = async (req, res) => {
    try {
        const { meetingId } = req.params;

        // Check if meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        const members = await MeetingMember.getMeetingMembers(meetingId);

        res.status(200).json({
            success: true,
            data: members,
            total: members.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting members',
            error: error.message
        });
    }
};

// @desc    Get single meeting member
// @route   GET /api/meeting-members/:id
// @access  Private
export const getMeetingMemberById = async (req, res) => {
    try {
        const member = await MeetingMember.findById(req.params.id)
            .populate('meetingId', 'meetingTitle meetingDate')
            .populate('staffId', 'staffName emailAddress mobileNo');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Meeting member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: member
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting member',
            error: error.message
        });
    }
};

// @desc    Add member to meeting
// @route   POST /api/meetings/:meetingId/members
// @access  Private
export const addMeetingMember = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { staffId, isPresent, remarks } = req.body;

        // Check if meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Check if staff exists
        const staff = await Staff.findById(staffId);
        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        // Check if member already added
        const existingMember = await MeetingMember.findOne({ meetingId, staffId });
        if (existingMember) {
            return res.status(400).json({
                success: false,
                message: 'Staff member is already added to this meeting'
            });
        }

        const member = await MeetingMember.create({
            meetingId,
            staffId,
            isPresent: isPresent || false,
            remarks
        });

        const populatedMember = await MeetingMember.findById(member._id)
            .populate('staffId', 'staffName emailAddress mobileNo');

        res.status(201).json({
            success: true,
            message: 'Member added to meeting successfully',
            data: populatedMember
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding member to meeting',
            error: error.message
        });
    }
};

// @desc    Add multiple members to meeting
// @route   POST /api/meetings/:meetingId/members/bulk
// @access  Private
export const addMultipleMeetingMembers = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { staffIds } = req.body; // Array of staff IDs

        if (!Array.isArray(staffIds) || staffIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide an array of staff IDs'
            });
        }

        // Check if meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        // Get existing members to avoid duplicates
        const existingMembers = await MeetingMember.find({ meetingId });
        const existingStaffIds = existingMembers.map(m => m.staffId.toString());

        // Filter out already added staff
        const newStaffIds = staffIds.filter(id => !existingStaffIds.includes(id.toString()));

        if (newStaffIds.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'All staff members are already added to this meeting'
            });
        }

        // Verify all staff exist
        const staffMembers = await Staff.find({ _id: { $in: newStaffIds } });
        if (staffMembers.length !== newStaffIds.length) {
            return res.status(404).json({
                success: false,
                message: 'One or more staff members not found'
            });
        }

        // Create members in bulk
        const membersToCreate = newStaffIds.map(staffId => ({
            meetingId,
            staffId,
            isPresent: false
        }));

        const members = await MeetingMember.insertMany(membersToCreate);

        res.status(201).json({
            success: true,
            message: `${members.length} member(s) added to meeting successfully`,
            data: members
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding members to meeting',
            error: error.message
        });
    }
};

// @desc    Update meeting member (attendance, remarks)
// @route   PUT /api/meeting-members/:id
// @access  Private
export const updateMeetingMember = async (req, res) => {
    try {
        const { isPresent, remarks } = req.body;

        const member = await MeetingMember.findByIdAndUpdate(
            req.params.id,
            { isPresent, remarks },
            { new: true, runValidators: true }
        )
            .populate('meetingId', 'meetingTitle meetingDate')
            .populate('staffId', 'staffName emailAddress');

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Meeting member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Meeting member updated successfully',
            data: member
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating meeting member',
            error: error.message
        });
    }
};

// @desc    Mark attendance
// @route   PUT /api/meeting-members/:id/attendance
// @access  Private
export const markAttendance = async (req, res) => {
    try {
        const { isPresent } = req.body;

        const member = await MeetingMember.findById(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Meeting member not found'
            });
        }

        if (isPresent) {
            await member.markPresent();
        } else {
            await member.markAbsent();
        }

        res.status(200).json({
            success: true,
            message: `Attendance marked as ${isPresent ? 'present' : 'absent'}`,
            data: member
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error marking attendance',
            error: error.message
        });
    }
};

// @desc    Remove member from meeting
// @route   DELETE /api/meeting-members/:id
// @access  Private
export const removeMeetingMember = async (req, res) => {
    try {
        const member = await MeetingMember.findByIdAndDelete(req.params.id);

        if (!member) {
            return res.status(404).json({
                success: false,
                message: 'Meeting member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Member removed from meeting successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error removing member from meeting',
            error: error.message
        });
    }
};

// @desc    Get attendance statistics for a meeting
// @route   GET /api/meetings/:meetingId/attendance
// @access  Private
export const getMeetingAttendance = async (req, res) => {
    try {
        const { meetingId } = req.params;

        // Check if meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        const attendance = await MeetingMember.getAttendanceCount(meetingId);

        res.status(200).json({
            success: true,
            data: {
                ...attendance,
                attendancePercentage: attendance.total > 0 
                    ? ((attendance.present / attendance.total) * 100).toFixed(2) 
                    : 0
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting attendance',
            error: error.message
        });
    }
};
