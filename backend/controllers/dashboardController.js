const Achievement = require('../models/Achievement');
const User = require('../models/User');

// GET /api/dashboard/student
exports.getStudentDashboard = async (req, res) => {
  try {
    const userId = req.user.id;

    const achievements = await Achievement.find({ userId })
      .populate('facultyVerifiedBy', 'name')
      .populate('adminVerifiedBy', 'name')
      .sort('-createdAt');

    const totalScore = achievements
      .filter(a => a.status === 'admin_approved')
      .reduce((sum, a) => sum + a.score, 0);

    const summary = {
      total: achievements.length,
      pending: achievements.filter(a => a.status === 'pending').length,
      faculty_approved: achievements.filter(a => a.status === 'faculty_approved').length,
      admin_approved: achievements.filter(a => a.status === 'admin_approved').length,
      rejected: achievements.filter(a => a.status === 'rejected').length
    };

    res.json({
      success: true,
      data: {
        totalScore,
        placementReady: totalScore >= 50,
        summary,
        achievements
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/admin
exports.getAdminDashboard = async (req, res) => {
  try {
    const [
      totalSubmissions,
      pendingFaculty,
      pendingAdmin,
      totalStudents,
      placementReady
    ] = await Promise.all([
      Achievement.countDocuments(),
      Achievement.countDocuments({ status: 'pending' }),
      Achievement.countDocuments({ status: 'faculty_approved' }),
      User.countDocuments({ role: 'student' }),
      User.countDocuments({ role: 'student', placementReady: true })
    ]);

    // Department-wise stats
    const deptStats = await Achievement.aggregate([
      { $match: { status: 'admin_approved' } },
      {
        $group: {
          _id: '$department',
          totalAchievements: { $sum: 1 },
          totalScore: { $sum: '$score' }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    res.json({
      success: true,
      data: {
        totalSubmissions,
        pendingApprovals: {
          awaitingFaculty: pendingFaculty,
          awaitingAdmin: pendingAdmin,
          total: pendingFaculty + pendingAdmin
        },
        totalStudents,
        placementReady,
        departmentStats: deptStats
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/dashboard/placement
exports.getPlacementDashboard = async (req, res) => {
  try {
    const { department, minScore = 50 } = req.query;

    const filter = {
      role: 'student',
      totalScore: { $gte: parseInt(minScore) }
    };
    if (department) filter.department = department;

    const students = await User.find(filter)
      .select('-password')
      .sort('-totalScore');

    res.json({
      success: true,
      count: students.length,
      data: students.map(s => ({
        id: s._id,
        name: s.name,
        email: s.email,
        rollNumber: s.rollNumber,
        department: s.department,
        batch: s.batch,
        totalScore: s.totalScore,
        achievementsCount: s.achievementsCount,
        placementReady: s.placementReady
      }))
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
