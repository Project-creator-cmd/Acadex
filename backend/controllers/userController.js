const User = require('../models/User');
const Achievement = require('../models/Achievement');

// GET /api/users/profile/:id
exports.getUserProfile = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    const achievements = await Achievement.find({
      userId: req.params.id,
      status: 'admin_approved'
    }).sort('-createdAt');

    res.json({ success: true, data: { user, achievements } });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/:id/score
exports.getUserScore = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('name email department totalScore achievementsCount placementReady');
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });

    // Verify score by summing admin_approved achievements
    const scoreData = await Achievement.aggregate([
      { $match: { userId: user._id, status: 'admin_approved' } },
      { $group: { _id: null, total: { $sum: '$score' }, count: { $sum: 1 } } }
    ]);

    const computed = scoreData[0] || { total: 0, count: 0 };

    res.json({
      success: true,
      data: {
        userId: user._id,
        name: user.name,
        department: user.department,
        totalScore: computed.total,
        achievementsCount: computed.count,
        placementReady: computed.total >= 50
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/users/students
exports.getStudents = async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.user.role === 'faculty') filter.department = req.user.department;
    else if (req.query.department) filter.department = req.query.department;

    const students = await User.find(filter).select('-password').sort('-totalScore');
    res.json({ success: true, count: students.length, data: students });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
