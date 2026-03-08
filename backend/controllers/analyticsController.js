const Achievement = require('../models/Achievement');
const User = require('../models/User');
const AttendanceRelaxation = require('../models/AttendanceRelaxation');

// @desc    Get dashboard statistics
// @route   GET /api/analytics/dashboard
// @access  Private (Admin/Faculty)
exports.getDashboardStats = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    }

    const totalStudents = await User.countDocuments({ ...filter, role: 'student' });
    const totalAchievements = await Achievement.countDocuments(filter);
    const pendingVerifications = await Achievement.countDocuments({ ...filter, status: 'pending' });
    const approvedAchievements = await Achievement.countDocuments({ ...filter, status: 'approved' });
    const placementReadyStudents = await User.countDocuments({ ...filter, role: 'student', placementReady: true });

    const stats = {
      totalStudents,
      totalAchievements,
      pendingVerifications,
      approvedAchievements,
      placementReadyStudents,
      averageScore: 0
    };

    // Calculate average score
    const students = await User.find({ ...filter, role: 'student' });
    if (students.length > 0) {
      const totalScore = students.reduce((sum, student) => sum + student.totalScore, 0);
      stats.averageScore = Math.round(totalScore / students.length);
    }

    res.json({ success: true, data: stats });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get achievement trends
// @route   GET /api/analytics/trends
// @access  Private (Admin/Faculty)
exports.getAchievementTrends = async (req, res) => {
  try {
    let filter = {};
    
    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    }

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Achievement.aggregate([
      {
        $match: {
          ...filter,
          createdAt: { $gte: sixMonthsAgo },
          status: 'approved'
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$createdAt' },
            month: { $month: '$createdAt' }
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: { '_id.year': 1, '_id.month': 1 }
      }
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get leaderboard
// @route   GET /api/analytics/leaderboard
// @access  Private
exports.getLeaderboard = async (req, res) => {
  try {
    const { department, limit = 10 } = req.query;
    
    let filter = { role: 'student' };
    
    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    } else if (department) {
      filter.department = department;
    }

    const leaderboard = await User.find(filter)
      .select('name email rollNumber department totalScore achievementsCount placementReady')
      .sort('-totalScore')
      .limit(parseInt(limit));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get category distribution
// @route   GET /api/analytics/category-distribution
// @access  Private (Admin/Faculty)
exports.getCategoryDistribution = async (req, res) => {
  try {
    let filter = { status: 'approved' };
    
    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    }

    const distribution = await Achievement.aggregate([
      { $match: filter },
      {
        $group: {
          _id: '$type',
          count: { $sum: 1 },
          totalPoints: { $sum: '$points' }
        }
      },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get performance distribution
// @route   GET /api/analytics/performance-distribution
// @access  Private (Admin/Faculty)
exports.getPerformanceDistribution = async (req, res) => {
  try {
    let filter = { role: 'student' };
    
    if (req.user.role === 'faculty') {
      filter.department = req.user.department;
    }

    const students = await User.find(filter).select('totalScore');

    const distribution = {
      excellent: 0,    // > 100
      good: 0,         // 50-100
      average: 0,      // 20-50
      low: 0           // < 20
    };

    students.forEach(student => {
      if (student.totalScore > 100) distribution.excellent++;
      else if (student.totalScore >= 50) distribution.good++;
      else if (student.totalScore >= 20) distribution.average++;
      else distribution.low++;
    });

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
