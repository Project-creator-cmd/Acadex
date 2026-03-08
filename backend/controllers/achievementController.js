const Achievement = require('../models/Achievement');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const scoringEngine = require('../utils/scoringEngine');

// @desc    Create achievement
// @route   POST /api/achievements
// @access  Private (Student/Faculty)
exports.createAchievement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Please upload a certificate' });
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        { folder: 'acadex/certificates', resource_type: 'auto' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(req.file.buffer);
    });

    const achievementData = {
      ...req.body,
      userId: req.user.id,
      department: req.user.department,
      certificateUrl: result.secure_url
    };

    const achievement = await Achievement.create(achievementData);

    res.status(201).json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get my achievements
// @route   GET /api/achievements/my-achievements
// @access  Private
exports.getMyAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.find({ userId: req.user.id })
      .populate('verifiedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get all achievements (Faculty/Admin)
// @route   GET /api/achievements
// @access  Private (Faculty/Admin)
exports.getAllAchievements = async (req, res) => {
  try {
    const { status, type, department } = req.query;
    
    let query = {};
    
    // Department isolation for faculty
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    } else if (department) {
      query.department = department;
    }

    if (status) query.status = status;
    if (type) query.type = type;

    const achievements = await Achievement.find(query)
      .populate('userId', 'name email rollNumber')
      .populate('verifiedBy', 'name')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get pending achievements
// @route   GET /api/achievements/pending/list
// @access  Private (Faculty/Admin)
exports.getPendingAchievements = async (req, res) => {
  try {
    let query = { status: 'pending' };
    
    if (req.user.role === 'faculty') {
      query.department = req.user.department;
    }

    const achievements = await Achievement.find(query)
      .populate('userId', 'name email rollNumber')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Get achievement by ID
// @route   GET /api/achievements/:id
// @access  Private
exports.getAchievementById = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id)
      .populate('userId', 'name email rollNumber department')
      .populate('verifiedBy', 'name email');

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    // Check access
    if (req.user.role === 'student' && achievement.userId._id.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    res.json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Verify achievement
// @route   PUT /api/achievements/:id/verify
// @access  Private (Faculty/Admin)
exports.verifyAchievement = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    // Department check for faculty
    if (req.user.role === 'faculty' && achievement.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    achievement.status = status;
    achievement.remarks = remarks;
    achievement.verifiedBy = req.user.id;

    // Calculate points if approved
    if (status === 'approved') {
      achievement.points = await scoringEngine.calculatePoints(achievement);
      
      // Update user score
      const user = await User.findById(achievement.userId);
      user.totalScore += achievement.points;
      user.achievementsCount += 1;
      
      // Check placement readiness (threshold: 50 points)
      user.placementReady = user.totalScore >= 50;
      
      await user.save();
    }

    await achievement.save();

    res.json({ success: true, data: achievement });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// @desc    Delete achievement
// @route   DELETE /api/achievements/:id
// @access  Private
exports.deleteAchievement = async (req, res) => {
  try {
    const achievement = await Achievement.findById(req.params.id);

    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Achievement not found' });
    }

    // Only owner or admin can delete
    if (achievement.userId.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    // If approved, deduct points
    if (achievement.status === 'approved') {
      const user = await User.findById(achievement.userId);
      user.totalScore -= achievement.points;
      user.achievementsCount -= 1;
      user.placementReady = user.totalScore >= 50;
      await user.save();
    }

    await achievement.deleteOne();

    res.json({ success: true, message: 'Achievement deleted' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
