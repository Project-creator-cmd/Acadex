const mongoose = require('mongoose');

const teamAchievementSchema = new mongoose.Schema({
  eventName: {
    type: String,
    required: [true, 'Event name is required'],
    trim: true
  },
  teamName: {
    type: String,
    required: [true, 'Team name is required'],
    trim: true
  },
  teamMembers: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  }],
  position: {
    type: String,
    trim: true
  },
  certificateUrl: {
    type: String,
    required: [true, 'Certificate URL is required']
  },
  certificateHash: {
    type: String,
    required: true
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Flagged'],
    default: 'Pending'
  },
  flagReason: {
    type: String
  },
  verifiedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  remarks: {
    type: String
  },
  points: {
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

teamAchievementSchema.index({ certificateHash: 1 });
teamAchievementSchema.index({ uploadedBy: 1, eventName: 1, teamName: 1 });
teamAchievementSchema.index({ status: 1 });
teamAchievementSchema.index({ teamMembers: 1 });

module.exports = mongoose.model('TeamAchievement', teamAchievementSchema);
