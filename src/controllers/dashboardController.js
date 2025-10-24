import Meeting from '../models/Meeting.js';
import Staff from '../models/Staff.js';
import MeetingMember from '../models/MeetingMember.js';
import MeetingDocument from '../models/MeetingDocument.js';
import MeetingType from '../models/MeetingType.js';

// @desc    Get dashboard overview statistics
// @route   GET /api/dashboard/overview
// @access  Private
export const getDashboardOverview = async (req, res) => {
    try {
        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
        
        // Get basic counts
        const [
            totalMeetings,
            totalStaff,
            totalMeetingTypes,
            totalDocuments,
            meetingsThisMonth,
            meetingsThisWeek,
            upcomingMeetings,
            recentMeetings
        ] = await Promise.all([
            Meeting.countDocuments(),
            Staff.countDocuments(),
            MeetingType.countDocuments(),
            MeetingDocument.countDocuments(),
            Meeting.countDocuments({ 
                meetingDate: { $gte: startOfMonth },
                status: { $ne: 'Cancelled' }
            }),
            Meeting.countDocuments({ 
                meetingDate: { $gte: startOfWeek },
                status: { $ne: 'Cancelled' }
            }),
            Meeting.countDocuments({ 
                meetingDate: { $gte: now },
                status: 'Scheduled'
            }),
            Meeting.find({ status: { $ne: 'Cancelled' } })
                .populate('meetingTypeId', 'meetingTypeName')
                .sort({ meetingDate: -1 })
                .limit(5)
        ]);

        // Get meeting status breakdown
        const meetingStatusStats = await Meeting.aggregate([
            {
                $group: {
                    _id: '$status',
                    count: { $sum: 1 }
                }
            }
        ]);

        // Get attendance statistics
        const attendanceStats = await MeetingMember.aggregate([
            {
                $group: {
                    _id: null,
                    totalMembers: { $sum: 1 },
                    presentMembers: { 
                        $sum: { $cond: ['$isPresent', 1, 0] }
                    }
                }
            }
        ]);

        // Get most active staff members
        const activeStaff = await MeetingMember.aggregate([
            {
                $group: {
                    _id: '$staffId',
                    meetingCount: { $sum: 1 },
                    attendanceCount: { 
                        $sum: { $cond: ['$isPresent', 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'staff',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staffInfo'
                }
            },
            {
                $unwind: '$staffInfo'
            },
            {
                $project: {
                    staffName: '$staffInfo.staffName',
                    emailAddress: '$staffInfo.emailAddress',
                    meetingCount: 1,
                    attendanceCount: 1,
                    attendanceRate: {
                        $multiply: [
                            { $divide: ['$attendanceCount', '$meetingCount'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { meetingCount: -1 }
            },
            {
                $limit: 5
            }
        ]);

        // Get meeting types usage
        const meetingTypeUsage = await Meeting.aggregate([
            {
                $group: {
                    _id: '$meetingTypeId',
                    count: { $sum: 1 }
                }
            },
            {
                $lookup: {
                    from: 'meetingtypes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'meetingType'
                }
            },
            {
                $unwind: '$meetingType'
            },
            {
                $project: {
                    meetingTypeName: '$meetingType.meetingTypeName',
                    count: 1
                }
            },
            {
                $sort: { count: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                overview: {
                    totalMeetings,
                    totalStaff,
                    totalMeetingTypes,
                    totalDocuments,
                    meetingsThisMonth,
                    meetingsThisWeek,
                    upcomingMeetings
                },
                meetingStatusStats,
                attendanceStats: attendanceStats[0] || { totalMembers: 0, presentMembers: 0 },
                activeStaff,
                meetingTypeUsage,
                recentMeetings
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching dashboard overview',
            error: error.message
        });
    }
};

// @desc    Get meeting analytics
// @route   GET /api/dashboard/analytics
// @access  Private
export const getMeetingAnalytics = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        let startDate;
        const now = new Date();
        
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        // Meeting trends over time
        const meetingTrends = await Meeting.aggregate([
            {
                $match: {
                    meetingDate: { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: {
                        year: { $year: '$meetingDate' },
                        month: { $month: '$meetingDate' },
                        day: { $dayOfMonth: '$meetingDate' }
                    },
                    count: { $sum: 1 },
                    completed: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    cancelled: {
                        $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                    }
                }
            },
            {
                $sort: { '_id.year': 1, '_id.month': 1, '_id.day': 1 }
            }
        ]);

        // Average attendance rate
        const attendanceAnalytics = await MeetingMember.aggregate([
            {
                $lookup: {
                    from: 'meetings',
                    localField: 'meetingId',
                    foreignField: '_id',
                    as: 'meeting'
                }
            },
            {
                $unwind: '$meeting'
            },
            {
                $match: {
                    'meeting.meetingDate': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$meetingId',
                    totalMembers: { $sum: 1 },
                    presentMembers: { 
                        $sum: { $cond: ['$isPresent', 1, 0] }
                    },
                    meetingTitle: { $first: '$meeting.meetingTitle' },
                    meetingDate: { $first: '$meeting.meetingDate' }
                }
            },
            {
                $project: {
                    meetingTitle: 1,
                    meetingDate: 1,
                    totalMembers: 1,
                    presentMembers: 1,
                    attendanceRate: {
                        $multiply: [
                            { $divide: ['$presentMembers', '$totalMembers'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { meetingDate: -1 }
            }
        ]);

        // Calculate average attendance rate
        const avgAttendanceRate = attendanceAnalytics.length > 0 
            ? attendanceAnalytics.reduce((sum, meeting) => sum + meeting.attendanceRate, 0) / attendanceAnalytics.length
            : 0;

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate: now,
                meetingTrends,
                attendanceAnalytics,
                avgAttendanceRate: Math.round(avgAttendanceRate * 100) / 100
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting analytics',
            error: error.message
        });
    }
};

// @desc    Get staff performance report
// @route   GET /api/dashboard/staff-performance
// @access  Private
export const getStaffPerformance = async (req, res) => {
    try {
        const { period = '30d' } = req.query;
        
        let startDate;
        const now = new Date();
        
        switch (period) {
            case '7d':
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case '30d':
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
                break;
            case '90d':
                startDate = new Date(now.getTime() - 90 * 24 * 60 * 60 * 1000);
                break;
            case '1y':
                startDate = new Date(now.getTime() - 365 * 24 * 60 * 60 * 1000);
                break;
            default:
                startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        }

        const staffPerformance = await MeetingMember.aggregate([
            {
                $lookup: {
                    from: 'meetings',
                    localField: 'meetingId',
                    foreignField: '_id',
                    as: 'meeting'
                }
            },
            {
                $unwind: '$meeting'
            },
            {
                $match: {
                    'meeting.meetingDate': { $gte: startDate }
                }
            },
            {
                $group: {
                    _id: '$staffId',
                    totalMeetings: { $sum: 1 },
                    attendedMeetings: { 
                        $sum: { $cond: ['$isPresent', 1, 0] }
                    },
                    missedMeetings: { 
                        $sum: { $cond: ['$isPresent', 0, 1] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'staff',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'staffInfo'
                }
            },
            {
                $unwind: '$staffInfo'
            },
            {
                $project: {
                    staffName: '$staffInfo.staffName',
                    emailAddress: '$staffInfo.emailAddress',
                    mobileNo: '$staffInfo.mobileNo',
                    totalMeetings: 1,
                    attendedMeetings: 1,
                    missedMeetings: 1,
                    attendanceRate: {
                        $multiply: [
                            { $divide: ['$attendedMeetings', '$totalMeetings'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { attendanceRate: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: {
                period,
                startDate,
                endDate: now,
                staffPerformance
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching staff performance',
            error: error.message
        });
    }
};

// @desc    Get meeting type analytics
// @route   GET /api/dashboard/meeting-types
// @access  Private
export const getMeetingTypeAnalytics = async (req, res) => {
    try {
        const meetingTypeStats = await Meeting.aggregate([
            {
                $group: {
                    _id: '$meetingTypeId',
                    totalMeetings: { $sum: 1 },
                    completedMeetings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Completed'] }, 1, 0] }
                    },
                    cancelledMeetings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Cancelled'] }, 1, 0] }
                    },
                    scheduledMeetings: {
                        $sum: { $cond: [{ $eq: ['$status', 'Scheduled'] }, 1, 0] }
                    }
                }
            },
            {
                $lookup: {
                    from: 'meetingtypes',
                    localField: '_id',
                    foreignField: '_id',
                    as: 'meetingType'
                }
            },
            {
                $unwind: '$meetingType'
            },
            {
                $project: {
                    meetingTypeName: '$meetingType.meetingTypeName',
                    totalMeetings: 1,
                    completedMeetings: 1,
                    cancelledMeetings: 1,
                    scheduledMeetings: 1,
                    completionRate: {
                        $multiply: [
                            { $divide: ['$completedMeetings', '$totalMeetings'] },
                            100
                        ]
                    }
                }
            },
            {
                $sort: { totalMeetings: -1 }
            }
        ]);

        res.status(200).json({
            success: true,
            data: meetingTypeStats
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting type analytics',
            error: error.message
        });
    }
};

// @desc    Get recent activity
// @route   GET /api/dashboard/recent-activity
// @access  Private
export const getRecentActivity = async (req, res) => {
    try {
        const { limit = 10 } = req.query;

        // Get recent meetings
        const recentMeetings = await Meeting.find({ status: { $ne: 'Cancelled' } })
            .populate('meetingTypeId', 'meetingTypeName')
            .sort({ modified: -1 })
            .limit(parseInt(limit));

        // Get recent staff additions
        const recentStaff = await Staff.find()
            .sort({ created: -1 })
            .limit(5);

        // Get recent document uploads
        const recentDocuments = await MeetingDocument.find()
            .populate('meetingId', 'meetingTitle')
            .populate('uploadedBy', 'staffName')
            .sort({ created: -1 })
            .limit(5);

        res.status(200).json({
            success: true,
            data: {
                recentMeetings,
                recentStaff,
                recentDocuments
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching recent activity',
            error: error.message
        });
    }
};





