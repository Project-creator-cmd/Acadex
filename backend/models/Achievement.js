const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  title: {
    type: String,
    required: [true, 'Please provide a title'],
    trim: true
  },
  type: {
    type: String,
    enum: ['hackathon', 'workshop', 'internship', 'certification', 'competition', 'sports', 'cultural', 'research', 'patent', 'conference'],
    required: true
  },
  category: {
    type: String,
    enum: ['participation', 'winner', 'runner-up', 'publication', 'granted'],
    required: true
  },
  level: {
    type: String,
    enum: ['college', 'state', 'national', 'international'],
    required: true
  },
  organizer: {
    type: String,
    required: true
  },
  date: {
    type: Date,
    required: true
  },
  description: {
    type: String
  },
  certificateUrl: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
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

// Index for faster queries
achievementSchema.index({ userId: 1, status: 1 });
achievementSchema.index({ department: 1 });

module.exports = mongoose.model('Achievement', achievementSchema);
