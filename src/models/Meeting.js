import mongoose from 'mongoose';

const meetingSchema = new mongoose.Schema({
    meetingDate: {
        type: Date,
        required: [true, 'Meeting date is required']
    },
    meetingTime: {
        type: Date,
        required: [true, 'Meeting time is required']
    },
    meetingTypeId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MeetingType',
        required: [true, 'Meeting type is required']
    },
    meetingTitle: {
        type: String,
        required: [true, 'Meeting title is required'],
        trim: true,
        maxlength: [500, 'Meeting title cannot exceed 500 characters']
    },
    meetingDescription: {
        type: String,
        maxlength: [2500, 'Meeting description cannot exceed 2500 characters']
    },
    documentPath: {
        type: String,
        maxlength: [250, 'Document path cannot exceed 250 characters']
    },
    remarks: {
        type: String,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    },
    cancellationDateTime: {
        type: Date,
        default: null
    },
    cancellationReason: {
        type: String,
        maxlength: [500, 'Cancellation reason cannot exceed 500 characters']
    },
    status: {
        type: String,
        enum: ['Scheduled', 'Ongoing', 'Completed', 'Cancelled'],
        default: 'Scheduled'
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
meetingSchema.index({ meetingDate: -1 });
meetingSchema.index({ meetingTypeId: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ meetingDate: -1, status: 1 });

// Virtual for getting meeting members
meetingSchema.virtual('members', {
    ref: 'MeetingMember',
    localField: '_id',
    foreignField: 'meetingId'
});

// Virtual for getting meeting documents
meetingSchema.virtual('documents', {
    ref: 'MeetingDocument',
    localField: '_id',
    foreignField: 'meetingId'
});

// Method to check if meeting is cancelled
meetingSchema.methods.isCancelled = function() {
    return this.status === 'Cancelled' && this.cancellationDateTime !== null;
};

// Method to cancel meeting
meetingSchema.methods.cancelMeeting = function(reason) {
    this.status = 'Cancelled';
    this.cancellationDateTime = new Date();
    this.cancellationReason = reason;
    return this.save();
};

export default mongoose.model('Meeting', meetingSchema);
