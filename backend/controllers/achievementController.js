const Achievement = require('../models/Achievement');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { calculateScore } = require('../utils/scoringEngine');

// POST /api/achievements
exports.createAchievement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Certificate file is required' });
    }

    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'acadex/certificates', resource_type: 'auto' },
        (err, data) => (err ? reject(err) : resolve(data))
      );
      stream.end(req.file.buffer);
    });

    const achievement = await Achievement.create({
      ...req.body,
      userId: req.user.id,
      department: req.user.department,
      file_url: result.secure_url,
      status: 'pending'
    });

    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/achievements/my-achievements
exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
      .populate('facultyVerifiedBy', 'name')
      .populate('adminVerifiedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/achievements/pending/list
// Faculty → pending achievements in their department
// Admin   → faculty_approved achievements (their queue)
exports.getPendingAchievements = async (req, res) => {
  try {
    let query;

    if (req.user.role === 'faculty') {
      // Match on the department field stored directly on the achievement
      // (set at upload time from req.user.department)
      query = {
        status: 'pending',
        department: req.user.department
      };
    } else {
      // Admin sees everything that faculty has approved
      query = { status: 'faculty_approved' };
    }

    const achievements = await Achievement.find(query)
      .populate('userId', 'name email rollNumber department')
      .populate('facultyVerifiedBy', 'name')
      .sort('-createdAt');

    // Safety net: if department wasn't stored on achievement (legacy data),
    // fall back to filtering via populated userId.department
    const filtered = achievements.filter(a => {
      if (!a.userId) return false;
      if (req.user.role === 'faculty') {
        return a.department === req.user.department ||
               a.userId.department === req.user.department;
      }
      return true;
    });

    res.json({ success: true, count: filtered.length, data: filtered });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/achievements
exports.getAllAchievements = async (req, res) => {
  try {
    const { status, type, department } = req.query;
    const query = {};

    if (req.user.role === 'faculty') {
      query.department = req.user.department;
      query.status = status || 'pending';
    } else {
      if (department) query.department = department;
      if (status) query.status = status;
    }

    if (type) query.type = type;

    const achievements = await Achievement.find(query)
      .populate('userId', 'name email rollNumber department')
      .populate('facultyVerifiedBy', 'name')
      .populate('adminVerifiedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// GET /api/achievements/:id
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('userId', 'name email rollNumber department')
      .populate('facultyVerifiedBy', 'name email')
      .populate('adminVerifiedBy', 'name email');

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    if (req.user.role === 'student' && achievement.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// PUT /api/achievements/:id/verify
// Faculty: pending → faculty_approved | rejected
// Admin:   faculty_approved → admin_approved | rejected
exports.verifyAchievement = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!status) {
      return res.status(400).json({ success: false, message: 'Status is required' });
    }

    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    if (req.user.role === 'faculty') {
      if (achievement.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: `Faculty can only verify pending achievements. Current: ${achievement.status}`
        });
      }
      if (!['faculty_approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Faculty can only set faculty_approved or rejected'
        });
      }
      if (achievement.department !== req.user.department) {
        return res.status(403).json({ success: false, message: 'Not authorized for this department' });
      }

      achievement.status = status;
      achievement.facultyVerifiedBy = req.user.id;
      achievement.facultyRemarks = remarks || '';
      achievement.facultyVerifiedAt = new Date();
      achievement.remarks = remarks || '';
    }

    if (req.user.role === 'admin') {
      if (achievement.status !== 'faculty_approved') {
        return res.status(400).json({
          success: false,
          message: `Admin can only verify faculty_approved achievements. Current: ${achievement.status}`
        });
      }
      if (!['admin_approved', 'rejected'].includes(status)) {
        return res.status(400).json({
          success: false,
          message: 'Admin can only set admin_approved or rejected'
        });
      }

      achievement.status = status;
      achievement.adminVerifiedBy = req.user.id;
      achievement.adminRemarks = remarks || '';
      achievement.adminVerifiedAt = new Date();
      achievement.remarks = remarks || '';

      // Compute and store score ONLY on admin_approved
      if (status === 'admin_approved') {
        const computedScore = calculateScore(achievement.type, achievement.level);
        achievement.score = computedScore;

        await User.findByIdAndUpdate(achievement.userId, {
          $inc: { totalScore: computedScore, achievementsCount: 1 }
        });

        const updatedUser = await User.findById(achievement.userId);
        updatedUser.placementReady = updatedUser.totalScore >= 50;
        await updatedUser.save();
      }
    }

    await achievement.save();
    res.json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// DELETE /api/achievements/:id
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    if (achievement.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (achievement.status === 'admin_approved' && achievement.score > 0) {
      const user = await User.findById(achievement.userId);
      user.totalScore = Math.max(0, user.totalScore - achievement.score);
      user.achievementsCount = Math.max(0, user.achievementsCount - 1);
      user.placementReady = user.totalScore >= 50;
      await user.save();
    }

    await achievement.deleteOne();
    res.json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
