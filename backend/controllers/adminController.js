const User = require('../models/User');
const Achievement = require('../models/Achievement');
const ScoringRule = require('../models/ScoringRule');

// @desc    Get all users
// @route   GET /api/admin/users
// @access  Private (Admin)
exports.getAllUsers = async (req, res) => {
  try {
    const { role, department } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (department) filter.department = department;

    const users = await User.find(filter).select('-password').sort('-createdAt');

    res.json({ success: true, count: users.length, data: users });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create user
// @route   POST /api/admin/users
// @access  Private (Admin)
exports.createUser = async (req, res) => {
  try {
    const user = await User.create(req.body);
    res.status(201).json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update user
// @route   PUT /api/admin/users/:id
// @access  Private (Admin)
exports.updateUser = async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete user
// @route   DELETE /api/admin/users/:id
// @access  Private (Admin)
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({ success: true, message: 'User deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Toggle user status
// @route   PUT /api/admin/users/:id/toggle-status
// @access  Private (Admin)
exports.toggleUserStatus = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({ success: true, data: user });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get scoring rules
// @route   GET /api/admin/scoring-rules
// @access  Private (Admin)
exports.getScoringRules = async (req, res) => {
  try {
    const rules = await ScoringRule.find().sort('type');
    res.json({ success: true, count: rules.length, data: rules });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Create scoring rule
// @route   POST /api/admin/scoring-rules
// @access  Private (Admin)
exports.createScoringRule = async (req, res) => {
  try {
    const rule = await ScoringRule.create(req.body);
    res.status(201).json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Update scoring rule
// @route   PUT /api/admin/scoring-rules/:id
// @access  Private (Admin)
exports.updateScoringRule = async (req, res) => {
  try {
    const rule = await ScoringRule.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    });

    if (!rule) {
      return res.status(404).json({ success: false, message: 'Rule not found' });
    }

    res.json({ success: true, data: rule });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get batch report
// @route   GET /api/admin/reports/batch
// @access  Private (Admin)
exports.getBatchReport = async (req, res) => {
  try {
    const { batch, department } = req.query;
    let filter = { role: 'student' };

    if (batch) filter.batch = batch;
    if (department) filter.department = department;

    const students = await User.find(filter).select('-password');
    
    const report = {
      totalStudents: students.length,
      averageScore: 0,
      placementReady: 0,
      topPerformers: []
    };

    if (students.length > 0) {
      const totalScore = students.reduce((sum, s) => sum + s.totalScore, 0);
      report.averageScore = Math.round(totalScore / students.length);
      report.placementReady = students.filter(s => s.placementReady).length;
      report.topPerformers = students.sort((a, b) => b.totalScore - a.totalScore).slice(0, 10);
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get department report
// @route   GET /api/admin/reports/department
// @access  Private (Admin)
exports.getDepartmentReport = async (req, res) => {
  try {
    const departments = await User.distinct('department');
    
    const report = [];

    for (const dept of departments) {
      const students = await User.find({ department: dept, role: 'student' });
      const achievements = await Achievement.countDocuments({ department: dept, status: 'approved' });
      
      const totalScore = students.reduce((sum, s) => sum + s.totalScore, 0);
      
      report.push({
        department: dept,
        totalStudents: students.length,
        totalAchievements: achievements,
        averageScore: students.length > 0 ? Math.round(totalScore / students.length) : 0,
        placementReady: students.filter(s => s.placementReady).length
      });
    }

    res.json({ success: true, data: report });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
