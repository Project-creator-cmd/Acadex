const User = require('../models/User');
const Achievement = require('../models/Achievement');

// @desc    Get user profile
// @route   GET /api/users/profile/:id
// @access  Private
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    // Get achievements
    const achievements = await Achievement.find({ 
      userId: req.params.id, 
      status: 'approved' 
    }).sort('-createdAt');

    res.json({ 
      success: true, 
      data: {
        user,
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all students
// @route   GET /api/users/students
// @access  Private (Faculty/Admin)
exports.getStudents = async (req, res) => {
  try {
    let filter = { role: 'student' };

    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    } else if (req.query.department) {
      filter.department = req.query.department;
    }

    const students = await User.find(filter)
      .select('-password')
      .sort('-totalScore');

    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
