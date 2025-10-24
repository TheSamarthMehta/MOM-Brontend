import MeetingType from '../models/MeetingType.js';

// @desc    Get all meeting types
// @route   GET /api/meeting-types
// @access  Private
export const getAllMeetingTypes = async (req, res) => {
    try {
        const { search = '' } = req.query;
        
        const query = search 
            ? { meetingTypeName: { $regex: search, $options: 'i' } }
            : {};

        const meetingTypes = await MeetingType.find(query)
            .sort({ meetingTypeName: 1 });

        res.status(200).json({
            success: true,
            data: meetingTypes,
            total: meetingTypes.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting types',
            error: error.message
        });
    }
};

// @desc    Get single meeting type by ID
// @route   GET /api/meeting-types/:id
// @access  Private
export const getMeetingTypeById = async (req, res) => {
    try {
        const meetingType = await MeetingType.findById(req.params.id);

        if (!meetingType) {
            return res.status(404).json({
                success: false,
                message: 'Meeting type not found'
            });
        }

        res.status(200).json({
            success: true,
            data: meetingType
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting type',
            error: error.message
        });
    }
};

// @desc    Create new meeting type
// @route   POST /api/meeting-types
// @access  Private/Admin
export const createMeetingType = async (req, res) => {
    try {
        const { meetingTypeName, remarks } = req.body;

        // Check if meeting type already exists
        const existingType = await MeetingType.findOne({ meetingTypeName });
        if (existingType) {
            return res.status(400).json({
                success: false,
                message: 'Meeting type with this name already exists'
            });
        }

        const meetingType = await MeetingType.create({
            meetingTypeName,
            remarks
        });

        res.status(201).json({
            success: true,
            message: 'Meeting type created successfully',
            data: meetingType
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error creating meeting type',
            error: error.message
        });
    }
};

// @desc    Update meeting type
// @route   PUT /api/meeting-types/:id
// @access  Private/Admin
export const updateMeetingType = async (req, res) => {
    try {
        const { meetingTypeName, remarks } = req.body;

        // Check if new name already exists
        if (meetingTypeName) {
            const existingType = await MeetingType.findOne({ 
                meetingTypeName, 
                _id: { $ne: req.params.id } 
            });
            if (existingType) {
                return res.status(400).json({
                    success: false,
                    message: 'Meeting type with this name already exists'
                });
            }
        }

        const meetingType = await MeetingType.findByIdAndUpdate(
            req.params.id,
            { meetingTypeName, remarks },
            { new: true, runValidators: true }
        );

        if (!meetingType) {
            return res.status(404).json({
                success: false,
                message: 'Meeting type not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Meeting type updated successfully',
            data: meetingType
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating meeting type',
            error: error.message
        });
    }
};

// @desc    Delete meeting type
// @route   DELETE /api/meeting-types/:id
// @access  Private/Admin
export const deleteMeetingType = async (req, res) => {
    try {
        const meetingType = await MeetingType.findByIdAndDelete(req.params.id);

        if (!meetingType) {
            return res.status(404).json({
                success: false,
                message: 'Meeting type not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Meeting type deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting meeting type',
            error: error.message
        });
    }
};
