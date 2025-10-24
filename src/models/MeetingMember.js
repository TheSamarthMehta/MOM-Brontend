import mongoose from 'mongoose';

const meetingMemberSchema = new mongoose.Schema({
    meetingId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Meeting',
        required: [true, 'Meeting ID is required']
    },
    staffId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Staff',
        required: [true, 'Staff ID is required']
    },
    isPresent: {
        type: Boolean,
        default: false
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

// Compound index to ensure a staff member is not added twice to the same meeting
meetingMemberSchema.index({ meetingId: 1, staffId: 1 }, { unique: true });

// Index for queries
meetingMemberSchema.index({ staffId: 1 });
meetingMemberSchema.index({ isPresent: 1 });

// Method to mark attendance
meetingMemberSchema.methods.markPresent = function() {
    this.isPresent = true;
    return this.save();
};

meetingMemberSchema.methods.markAbsent = function() {
    this.isPresent = false;
    return this.save();
};

// Static method to get all members for a meeting
meetingMemberSchema.statics.getMeetingMembers = function(meetingId) {
    return this.find({ meetingId }).populate('staffId', 'staffName emailAddress mobileNo');
};

// Static method to get attendance count
meetingMemberSchema.statics.getAttendanceCount = async function(meetingId) {
    const total = await this.countDocuments({ meetingId });
    const present = await this.countDocuments({ meetingId, isPresent: true });
    return { total, present, absent: total - present };
};

export default mongoose.model('MeetingMember', meetingMemberSchema);
