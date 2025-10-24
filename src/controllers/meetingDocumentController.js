import MeetingDocument from '../models/MeetingDocument.js';
import Meeting from '../models/Meeting.js';

// @desc    Get all documents for a meeting
// @route   GET /api/meetings/:meetingId/documents
// @access  Private
export const getMeetingDocuments = async (req, res) => {
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

        const documents = await MeetingDocument.getMeetingDocuments(meetingId);

        res.status(200).json({
            success: true,
            data: documents,
            total: documents.length
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching meeting documents',
            error: error.message
        });
    }
};

// @desc    Get single document by ID
// @route   GET /api/meeting-documents/:id
// @access  Private
export const getDocumentById = async (req, res) => {
    try {
        const document = await MeetingDocument.findById(req.params.id)
            .populate('meetingId', 'meetingTitle meetingDate')
            .populate('uploadedBy', 'staffName emailAddress');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.status(200).json({
            success: true,
            data: document
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching document',
            error: error.message
        });
    }
};

// @desc    Add document to meeting
// @route   POST /api/meetings/:meetingId/documents
// @access  Private
export const addMeetingDocument = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const {
            documentName,
            documentPath,
            sequence,
            remarks,
            fileSize,
            fileType,
            uploadedBy
        } = req.body;

        // Check if meeting exists
        const meeting = await Meeting.findById(meetingId);
        if (!meeting) {
            return res.status(404).json({
                success: false,
                message: 'Meeting not found'
            });
        }

        const document = await MeetingDocument.create({
            meetingId,
            documentName,
            documentPath,
            sequence,
            remarks,
            fileSize,
            fileType,
            uploadedBy
        });

        const populatedDocument = await MeetingDocument.findById(document._id)
            .populate('uploadedBy', 'staffName emailAddress');

        res.status(201).json({
            success: true,
            message: 'Document added to meeting successfully',
            data: populatedDocument
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error adding document to meeting',
            error: error.message
        });
    }
};

// @desc    Update document
// @route   PUT /api/meeting-documents/:id
// @access  Private
export const updateMeetingDocument = async (req, res) => {
    try {
        const {
            documentName,
            documentPath,
            sequence,
            remarks,
            fileSize,
            fileType
        } = req.body;

        const document = await MeetingDocument.findByIdAndUpdate(
            req.params.id,
            {
                documentName,
                documentPath,
                sequence,
                remarks,
                fileSize,
                fileType
            },
            { new: true, runValidators: true }
        )
            .populate('meetingId', 'meetingTitle')
            .populate('uploadedBy', 'staffName emailAddress');

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        res.status(200).json({
            success: true,
            message: 'Document updated successfully',
            data: document
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error updating document',
            error: error.message
        });
    }
};

// @desc    Reorder documents
// @route   PUT /api/meetings/:meetingId/documents/reorder
// @access  Private
export const reorderDocuments = async (req, res) => {
    try {
        const { meetingId } = req.params;
        const { documentOrder } = req.body; // Array of { documentId, sequence }

        if (!Array.isArray(documentOrder) || documentOrder.length === 0) {
            return res.status(400).json({
                success: false,
                message: 'Please provide document order array'
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

        await MeetingDocument.reorderDocuments(meetingId, documentOrder);

        const updatedDocuments = await MeetingDocument.getMeetingDocuments(meetingId);

        res.status(200).json({
            success: true,
            message: 'Documents reordered successfully',
            data: updatedDocuments
        });
    } catch (error) {
        res.status(400).json({
            success: false,
            message: 'Error reordering documents',
            error: error.message
        });
    }
};

// @desc    Delete document
// @route   DELETE /api/meeting-documents/:id
// @access  Private
export const deleteMeetingDocument = async (req, res) => {
    try {
        const document = await MeetingDocument.findByIdAndDelete(req.params.id);

        if (!document) {
            return res.status(404).json({
                success: false,
                message: 'Document not found'
            });
        }

        // TODO: Delete actual file from storage here if needed
        // Example: deleteFileFromStorage(document.documentPath);

        res.status(200).json({
            success: true,
            message: 'Document deleted successfully',
            data: {}
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error deleting document',
            error: error.message
        });
    }
};

// @desc    Get document statistics for a meeting
// @route   GET /api/meetings/:meetingId/documents/stats
// @access  Private
export const getDocumentStats = async (req, res) => {
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

        const documents = await MeetingDocument.find({ meetingId });
        const totalDocuments = documents.length;
        const totalSize = documents.reduce((sum, doc) => sum + (doc.fileSize || 0), 0);

        // Group by file type
        const fileTypes = {};
        documents.forEach(doc => {
            const type = doc.fileType || 'unknown';
            fileTypes[type] = (fileTypes[type] || 0) + 1;
        });

        res.status(200).json({
            success: true,
            data: {
                totalDocuments,
                totalSize,
                totalSizeMB: (totalSize / (1024 * 1024)).toFixed(2),
                fileTypes
            }
        });
    } catch (error) {
        res.status(500).json({
            success: false,
            message: 'Error fetching document statistics',
            error: error.message
        });
    }
};
