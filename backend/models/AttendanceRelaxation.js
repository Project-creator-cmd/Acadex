const mongoose = require('mongoose');

const attendanceRelaxationSchema = new mongoose.Schema({
  studentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  achievementId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Achievement'
  },
  recommendedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  approvedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  reason: {
    type: String,
    required: true
  },
  relaxationDays: {
    type: Number,
    default: 0
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  remarks: {
    type: String
  },
  department: {
    type: String,
    required: true
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('AttendanceRelaxation', attendanceRelaxationSchema);
