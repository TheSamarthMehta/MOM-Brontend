import mongoose from 'mongoose';

const meetingDocumentSchema = new mongoose.Schema({
    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: [true, 'Meeting ID is required']
    },
    documentName: {
        type: String,
        required: [true, 'Document name is required'],
        trim: true,
        maxlength: [250, 'Document name cannot exceed 250 characters']
    },
    documentPath: {
        type: String,
        maxlength: [250, 'Document path cannot exceed 250 characters']
    },
    sequence: {
        type: mongoose.Schema.Types.Decimal128,
        default: 0,
        min: [0, 'Sequence cannot be negative']
    },
    remarks: {
        type: String,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    fileSize: {
        type: Number, // in bytes
        default: 0
    },
    fileType: {
        type: String,
        trim: true,
        maxlength: [50, 'File type cannot exceed 50 characters']
    },
    uploadedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff'
    }
}, {
    timestamps: { 
        createdAt: 'created', 
        updatedAt: 'modified' 
    }, // Match database schema field names
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Indexes for better query performance
meetingDocumentSchema.index({ meetingId: 1, sequence: 1 });
meetingDocumentSchema.index({ documentName: 1 });

// Pre-save middleware to auto-increment sequence if not provided
meetingDocumentSchema.pre('save', async function(next) {
    if (this.isNew && !this.sequence) {
        const lastDoc = await this.constructor
            .findOne({ meetingId: this.meetingId })
            .sort({ sequence: -1 });
        this.sequence = lastDoc ? lastDoc.sequence + 1 : 1;
    }
    next();
});

// Static method to get all documents for a meeting ordered by sequence
meetingDocumentSchema.statics.getMeetingDocuments = function(meetingId) {
    return this.find({ meetingId })
        .sort({ sequence: 1 })
        .populate('uploadedBy', 'staffName emailAddress');
};

// Static method to reorder documents
meetingDocumentSchema.statics.reorderDocuments = async function(meetingId, documentOrder) {
    // documentOrder is an array of {documentId, sequence} objects
    const bulkOps = documentOrder.map(({ documentId, sequence }) => ({
        updateOne: {
            filter: { _id: documentId, meetingId },
            update: { $set: { sequence } }
        }
    }));
    
    return this.bulkWrite(bulkOps);
};

export default mongoose.model('MeetingDocument', meetingDocumentSchema);
