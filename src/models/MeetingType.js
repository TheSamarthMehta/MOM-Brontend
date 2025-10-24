import mongoose from 'mongoose';

const meetingTypeSchema = new mongoose.Schema({
    meetingTypeName: {
        type: String,
        required: [true, 'Meeting type name is required'],
        unique: true,
        trim: true,
        maxlength: [250, 'Meeting type name cannot exceed 250 characters']
    },
    remarks: {
        type: String,
        maxlength: [500, 'Remarks cannot exceed 500 characters']
    }
}, {
    timestamps: { 
        createdAt: 'created', 
        updatedAt: 'modified' 
    }, // Match database schema field names
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Virtual to map 'created' to 'createdAt' for API response
meetingTypeSchema.virtual('createdAt').get(function() {
    return this.created;
});

// Virtual to map 'modified' to 'updatedAt' for API response
meetingTypeSchema.virtual('updatedAt').get(function() {
    return this.modified;
});

// Virtual for getting all meetings of this type
meetingTypeSchema.virtual('meetings', {
    ref: 'Meeting',
    localField: '_id',
    foreignField: 'meetingTypeId'
});

export default mongoose.model('MeetingType', meetingTypeSchema);
