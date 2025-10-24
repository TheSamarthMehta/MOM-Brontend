import Staff from '../models/Staff.js';

// @desc    Get all staff members
// @route   GET /api/staff
// @access  Private
export const getAllStaff = async (req, res) => {
    try {
        const { page = 1, limit = 10, search = '' } = req.query;
        
        const query = search 
            ? { 
                $or: [
                    { staffName: { $regex: search, $options: 'i' } },
                    { emailAddress: { $regex: search, $options: 'i' } },
                    { mobileNo: { $regex: search, $options: 'i' } }
                ]
            }
            : {};

        const staff = await Staff.find(query)
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await Staff.countDocuments(query);

        res.status(200).json({
            success: true,
            data: staff,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching staff members',
            error: error.message
        });
    }
};

// @desc    Get single staff member by ID
// @route   GET /api/staff/:id
// @access  Private
export const getStaffById = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: staff
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching staff member',
            error: error.message
        });
    }
};

// @desc    Create new staff member
// @route   POST /api/staff
// @access  Private
export const createStaff = async (req, res) => {
    try {
        const { staffName, mobileNo, emailAddress, role, department, remarks } = req.body;

        // Check if email already exists
        if (emailAddress) {
            const existingStaff = await Staff.findOne({ emailAddress });
            if (existingStaff) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff member with this email already exists'
                });
            }
        }

        const staff = await Staff.create({
            staffName,
            mobileNo,
            emailAddress,
            role,
            department,
            remarks
        });

        res.status(201).json({
            success: true,
            message: 'Staff member created successfully',
            data: staff
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating staff member',
            error: error.message
        });
    }
};

// @desc    Update staff member
// @route   PUT /api/staff/:id
// @access  Private
export const updateStaff = async (req, res) => {
    try {
        const { staffName, mobileNo, emailAddress, role, department, remarks } = req.body;

        // Check if email is being changed and if it already exists
        if (emailAddress) {
            const existingStaff = await Staff.findOne({ 
                emailAddress, 
                _id: { $ne: req.params.id } 
            });
            if (existingStaff) {
                return res.status(400).json({
                    success: false,
                    message: 'Staff member with this email already exists'
                });
            }
        }

        const staff = await Staff.findByIdAndUpdate(
            req.params.id,
            { staffName, mobileNo, emailAddress, role, department, remarks },
            { new: true, runValidators: true }
        );

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Staff member updated successfully',
            data: staff
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating staff member',
            error: error.message
        });
    }
};

// @desc    Delete staff member
// @route   DELETE /api/staff/:id
// @access  Private
export const deleteStaff = async (req, res) => {
    try {
        const staff = await Staff.findByIdAndDelete(req.params.id);

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Staff member deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting staff member',
            error: error.message
        });
    }
};

// @desc    Get staff member's meeting history
// @route   GET /api/staff/:id/meetings
// @access  Private
export const getStaffMeetings = async (req, res) => {
    try {
        const staff = await Staff.findById(req.params.id)
            .populate({
                path: 'meetings',
                populate: {
                    path: 'meetingId',
                    populate: { path: 'meetingTypeId' }
                }
            });

        if (!staff) {
            return res.status(404).json({
                success: false,
                message: 'Staff member not found'
            });
        }

        res.status(200).json({
            success: true,
            data: staff.meetings
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching staff meetings',
            error: error.message
        });
    }
};
