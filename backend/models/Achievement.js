const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true
  },
  type: {
    type: String,
    enum: ['participation', 'certification', 'internship', 'research', 'winner', 'hackathon', 'workshop', 'competition', 'sports', 'cultural', 'patent', 'conference'],
    required: true
  },
  level: {
    type: String,
    enum: ['college', 'state', 'national', 'international'],
    required: true
  },
  organizer: {
    type: String,
    required: true,
    trim: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String,
    trim: true
  },
  file_url: {
    type: String,
    required: true
  },
  // Two-step verification workflow
  status: {
    type: String,
    enum: ['pending', 'faculty_approved', 'admin_approved', 'rejected'],
    default: 'pending'
  },
  // Faculty verification
  facultyVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  facultyRemarks: {
    type: String
  },
  facultyVerifiedAt: {
    type: Date
  },
  // Admin verification
  adminVerifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  adminRemarks: {
    type: String
  },
  adminVerifiedAt: {
    type: Date
  },
  // General remarks (for rejection at any stage)
  remarks: {
    type: String
  },
  // Score only set after admin_approved
  score: {
    type: Number,
    default: 0
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

achievementSchema.index({ userId: 1, status: 1 });
achievementSchema.index({ department: 1, status: 1 });
achievementSchema.index({ status: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
