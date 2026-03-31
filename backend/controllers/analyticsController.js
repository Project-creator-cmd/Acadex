const Achievement = require('../models/Achievement');
const User = require('../models/User');
const mongoose = require('mongoose');

// GET /api/analytics/leaderboard
// Aggregates live scores from admin_approved achievements.
// Faculty → locked to their department.
// Admin/Placement → all, or filtered by ?department=
exports.getLeaderboard = async (req, res) => {
  try {
    const { department, limit = 50 } = req.query;

    // Resolve department scope
    const deptFilter = req.user.role === 'faculty'
      ? req.user.department
      : (department || null);

    // Step 1: Get all students in scope
    const studentFilter = { role: 'student' };
    if (deptFilter) studentFilter.department = deptFilter;

    const students = await User.find(studentFilter)
      .select('_id name email rollNumber department batch totalScore achievementsCount placementReady')
      .lean();

    if (students.length === 0) {
      return res.json({ success: true, count: 0, data: [] });
    }

    // Step 2: Aggregate scores from admin_approved achievements for these students
    const studentIds = students.map(s => s._id);

    const scoreMap = {};
    const countMap = {};

    const scores = await Achievement.aggregate([
      {
        $match: {
          status: 'admin_approved',
          userId: { $in: studentIds }
        }
      },
      {
        $group: {
          _id: '$userId',
          totalScore: { $sum: '$score' },
          achievementsCount: { $sum: 1 }
        }
      }
    ]);

    scores.forEach(s => {
      scoreMap[s._id.toString()] = s.totalScore;
      countMap[s._id.toString()] = s.achievementsCount;
    });

    // Step 3: Merge scores into student list (include students with 0 score too)
    const leaderboard = students
      .map(s => ({
        studentId: s._id,
        name: s.name,
        email: s.email,
        rollNumber: s.rollNumber,
        department: s.department,
        batch: s.batch,
        totalScore: scoreMap[s._id.toString()] || 0,
        achievementsCount: countMap[s._id.toString()] || 0,
        placementReady: (scoreMap[s._id.toString()] || 0) >= 50
      }))
      .sort((a, b) => b.totalScore - a.totalScore)
      .slice(0, parseInt(limit));

    res.json({ success: true, count: leaderboard.length, data: leaderboard });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/department-performance
exports.getDepartmentPerformance = async (req, res) => {
  try {
    const stats = await Achievement.aggregate([
      { $match: { status: 'admin_approved' } },
      {
        $group: {
          _id: '$department',
          totalAchievements: { $sum: 1 },
          totalScore: { $sum: '$score' },
          avgScore: { $avg: '$score' }
        }
      },
      { $sort: { totalScore: -1 } }
    ]);

    const enriched = await Promise.all(
      stats.map(async (dept) => {
        const studentCount = await User.countDocuments({ role: 'student', department: dept._id });
        return { ...dept, studentCount };
      })
    );

    res.json({ success: true, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/type-distribution
exports.getTypeDistribution = async (req, res) => {
  try {
    const filter = { status: 'admin_approved' };
    if (req.user.role === 'faculty') filter.department = req.user.department;

    const distribution = await Achievement.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 }, totalScore: { $sum: '$score' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') filter.department = req.user.department;

    const [
      totalStudents,
      totalAchievements,
      pendingVerifications,
      approvedAchievements,
      placementReadyStudents
    ] = await Promise.all([
      User.countDocuments({ ...filter, role: 'student' }),
      Achievement.countDocuments(filter),
      Achievement.countDocuments({ ...filter, status: 'pending' }),
      Achievement.countDocuments({ ...filter, status: 'admin_approved' }),
      User.countDocuments({ ...filter, role: 'student', placementReady: true })
    ]);

    const scoreAgg = await User.aggregate([
      { $match: { ...filter, role: 'student' } },
      { $group: { _id: null, avg: { $avg: '$totalScore' } } }
    ]);

    res.json({
      success: true,
      data: {
        totalStudents,
        totalAchievements,
        pendingVerifications,
        approvedAchievements,
        placementReadyStudents,
        averageScore: Math.round(scoreAgg[0]?.avg || 0)
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/trends
exports.getAchievementTrends = async (req, res) => {
  try {
    const filter = {};
    if (req.user.role === 'faculty') filter.department = req.user.department;

    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const trends = await Achievement.aggregate([
      { $match: { ...filter, status: 'admin_approved', createdAt: { $gte: sixMonthsAgo } } },
      {
        $group: {
          _id: { year: { $year: '$createdAt' }, month: { $month: '$createdAt' } },
          count: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    res.json({ success: true, data: trends });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/performance-distribution
exports.getPerformanceDistribution = async (req, res) => {
  try {
    const filter = { role: 'student' };
    if (req.user.role === 'faculty') filter.department = req.user.department;

    const students = await User.find(filter).select('totalScore');
    const distribution = { excellent: 0, good: 0, average: 0, low: 0 };

    students.forEach(({ totalScore }) => {
      if (totalScore > 100) distribution.excellent++;
      else if (totalScore >= 50) distribution.good++;
      else if (totalScore >= 20) distribution.average++;
      else distribution.low++;
    });

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/analytics/category-distribution
exports.getCategoryDistribution = async (req, res) => {
  try {
    const filter = { status: 'admin_approved' };
    if (req.user.role === 'faculty') filter.department = req.user.department;

    const distribution = await Achievement.aggregate([
      { $match: filter },
      { $group: { _id: '$type', count: { $sum: 1 }, totalScore: { $sum: '$score' } } },
      { $sort: { count: -1 } }
    ]);

    res.json({ success: true, data: distribution });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
