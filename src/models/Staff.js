import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema({
    staffName: {
        type: String,
        required: [true, 'Staff name is required'],
        trim: true,
        maxlength: [250, 'Staff name cannot exceed 250 characters']
    },
    mobileNo: {
        type: String,
        trim: true,
        maxlength: [20, 'Mobile number cannot exceed 20 characters'],
        match: [/^[0-9+\-\s()]*$/, 'Please enter a valid mobile number']
    },
    emailAddress: {
        type: String,
        trim: true,
        lowercase: true,
        maxlength: [100, 'Email address cannot exceed 100 characters'],
        match: [/^\S+@\S+\.\S+$/, 'Please enter a valid email address']
    },
    role: {
        type: String,
        enum: ['Admin', 'Convener', 'Staff'],
        default: 'Staff'
    },
    department: {
        type: String,
        trim: true,
        maxlength: [100, 'Department cannot exceed 100 characters']
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

// Indexes for better query performance
staffSchema.index({ staffName: 1 });
staffSchema.index({ emailAddress: 1 });
staffSchema.index({ mobileNo: 1 });

// Virtual for getting meetings where this staff is a member
staffSchema.virtual('meetings', {
    ref: 'MeetingMember',
    localField: '_id',
    foreignField: 'staffId'
});

export default mongoose.model('Staff', staffSchema);
