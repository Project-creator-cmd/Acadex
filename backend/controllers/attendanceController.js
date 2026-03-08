const AttendanceRelaxation = require('../models/AttendanceRelaxation');
const User = require('../models/User');

// @desc    Recommend attendance relaxation
// @route   POST /api/attendance/recommend
// @access  Private (Faculty)
exports.recommendRelaxation = async (req, res) => {
  try {
    const { studentId, achievementId, reason, relaxationDays } = req.body;

    // Check if student exists and belongs to same department
    const student = await User.findById(studentId);
    if (!student) {
      return res.status(404).json({ success: false, message: 'Student not found' });
    }

    if (student.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // Check eligibility (score > 50)
    if (student.totalScore < 50) {
      return res.status(400).json({ 
        success: false, 
        message: 'Student not eligible. Minimum score of 50 required.' 
      });
    }

    const relaxation = await AttendanceRelaxation.create({
      studentId,
      achievementId,
      recommendedBy: req.user.id,
      reason,
      relaxationDays,
      department: req.user.department
    });

    await relaxation.populate('studentId', 'name email rollNumber');

    res.status(201).json({ success: true, data: relaxation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my recommendations
// @route   GET /api/attendance/my-recommendations
// @access  Private (Faculty)
exports.getMyRecommendations = async (req, res) => {
  try {
    const recommendations = await AttendanceRelaxation.find({ recommendedBy: req.user.id })
      .populate('studentId', 'name email rollNumber')
      .populate('approvedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: recommendations.length, data: recommendations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending relaxations
// @route   GET /api/attendance/pending
// @access  Private (Admin)
exports.getPendingRelaxations = async (req, res) => {
  try {
    const relaxations = await AttendanceRelaxation.find({ status: 'pending' })
      .populate('studentId', 'name email rollNumber totalScore')
      .populate('recommendedBy', 'name email')
      .populate('achievementId', 'title type')
      .sort('-createdAt');

    res.json({ success: true, count: relaxations.length, data: relaxations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Approve/Reject relaxation
// @route   PUT /api/attendance/:id/approve
// @access  Private (Admin)
exports.approveRelaxation = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const relaxation = await AttendanceRelaxation.findById(req.params.id);

    if (!relaxation) {
      return res.status(404).json({ success: false, message: 'Relaxation request not found' });
    }

    relaxation.status = status;
    relaxation.remarks = remarks;
    relaxation.approvedBy = req.user.id;

    await relaxation.save();

    await relaxation.populate('studentId', 'name email');

    res.json({ success: true, data: relaxation });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my relaxations
// @route   GET /api/attendance/my-relaxations
// @access  Private (Student)
exports.getMyRelaxations = async (req, res) => {
  try {
    const relaxations = await AttendanceRelaxation.find({ studentId: req.user.id })
      .populate('recommendedBy', 'name')
      .populate('approvedBy', 'name')
      .populate('achievementId', 'title')
      .sort('-createdAt');

    res.json({ success: true, count: relaxations.length, data: relaxations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all relaxations
// @route   GET /api/attendance
// @access  Private
exports.getAllRelaxations = async (req, res) => {
  try {
    let query = {};

    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const relaxations = await AttendanceRelaxation.find(query)
      .populate('studentId', 'name email rollNumber')
      .populate('recommendedBy', 'name')
      .populate('approvedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: relaxations.length, data: relaxations });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
