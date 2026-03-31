const TeamAchievement = require('../models/TeamAchievement');
const User = require('../models/User');
const cloudinary = require('../config/cloudinary');
const { generateFileHash } = require('../utils/hashGenerator');

exports.uploadTeamAchievement = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: 'Certificate file is required' });
    }

    const { eventName, teamName, teamMembers, position } = req.body;
    const uploadedBy = req.user.id;

    if (!eventName || !teamName || !teamMembers) {
      return res.status(400).json({ success: false, message: 'Event name, team name, and team members are required' });
    }

    const teamMemberIds = JSON.parse(teamMembers);
    if (!Array.isArray(teamMemberIds) || teamMemberIds.length === 0) {
      return res.status(400).json({ success: false, message: 'Team members must be a non-empty array' });
    }

    const certificateHash = generateFileHash(req.file.buffer);

    // Case A: same student, same hash → reject
    const sameSameStudent = await TeamAchievement.findOne({ certificateHash, uploadedBy });
    if (sameSameStudent) {
      return res.status(409).json({
        success: false,
        message: 'Duplicate upload by same student',
        error: 'DUPLICATE_SAME_STUDENT'
      });
    }

    // Case C: same student, same event+team → reject
    const sameEventTeam = await TeamAchievement.findOne({
      uploadedBy,
      eventName: eventName.trim(),
      teamName: teamName.trim()
    });
    if (sameEventTeam) {
      return res.status(409).json({
        success: false,
        message: 'You have already uploaded a certificate for this event and team',
        error: 'DUPLICATE_EVENT_TEAM'
      });
    }

    // Case B: different student, same hash
    let status = 'Pending';
    let flagReason = null;

    const existingCert = await TeamAchievement.findOne({ certificateHash });
    if (existingCert) {
      const eventMatches = existingCert.eventName.toLowerCase() === eventName.toLowerCase().trim();
      const teamMatches = existingCert.teamName.toLowerCase() === teamName.toLowerCase().trim();
      const isTeamMember = existingCert.teamMembers.some(m => m.toString() === uploadedBy);

      if (!(eventMatches && teamMatches && isTeamMember)) {
        status = 'Flagged';
        flagReason = 'Certificate hash matches existing upload but event/team/member mismatch';
      }
    }

    // Upload to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'acadex/team-certificates', resource_type: 'auto' },
        (err, data) => (err ? reject(err) : resolve(data))
      );
      stream.end(req.file.buffer);
    });

    const teamAchievement = await TeamAchievement.create({
      eventName: eventName.trim(),
      teamName: teamName.trim(),
      teamMembers: teamMemberIds,
      position,
      certificateUrl: result.secure_url,
      certificateHash,
      uploadedBy,
      status,
      flagReason,
      department: req.user.department
    });

    await teamAchievement.populate('teamMembers uploadedBy', 'name email rollNumber');

    res.status(201).json({
      success: true,
      data: teamAchievement,
      message: status === 'Flagged' ? 'Upload successful but flagged for review' : 'Team achievement uploaded successfully'
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getStudentTeamAchievements = async (req, res) => {
  try {
    const studentId = req.params.id;

    if (req.user.role === 'student' && req.user.id !== studentId) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    const achievements = await TeamAchievement.find({
      $or: [{ uploadedBy: studentId }, { teamMembers: studentId }]
    })
      .populate('teamMembers', 'name email rollNumber')
      .populate('uploadedBy', 'name email rollNumber')
      .populate('verifiedBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getFlaggedAchievements = async (req, res) => {
  try {
    const query = { status: 'Flagged' };
    if (req.user.role === 'faculty') query.department = req.user.department;

    const flagged = await TeamAchievement.find(query)
      .populate('teamMembers', 'name email rollNumber')
      .populate('uploadedBy', 'name email rollNumber department')
      .populate('verifiedBy', 'name email')
      .sort('-createdAt');

    const enriched = await Promise.all(
      flagged.map(async (a) => {
        const duplicates = await TeamAchievement.find({
          certificateHash: a.certificateHash,
          _id: { $ne: a._id }
        })
          .populate('uploadedBy', 'name email rollNumber')
          .select('eventName teamName uploadedBy createdAt status');
        return { ...a.toObject(), duplicateUploads: duplicates };
      })
    );

    res.json({ success: true, count: enriched.length, data: enriched });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.verifyTeamAchievement = async (req, res) => {
  try {
    const { status, remarks } = req.body;

    if (!['Approved', 'Rejected', 'Pending'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status' });
    }

    const achievement = await TeamAchievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Team achievement not found' });
    }

    if (req.user.role === 'faculty' && achievement.department !== req.user.department) {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    achievement.status = status;
    achievement.remarks = remarks;
    achievement.verifiedBy = req.user.id;
    if (status === 'Approved') achievement.flagReason = null;

    if (status === 'Approved') {
      const basePoints = 15;
      achievement.points = basePoints * achievement.teamMembers.length;

      await User.updateMany(
        { _id: { $in: achievement.teamMembers } },
        { $inc: { totalScore: basePoints, achievementsCount: 1 } }
      );

      await User.updateMany(
        { _id: { $in: achievement.teamMembers }, totalScore: { $gte: 50 } },
        { placementReady: true }
      );
    }

    await achievement.save();
    await achievement.populate('teamMembers uploadedBy verifiedBy', 'name email');

    res.json({ success: true, data: achievement, message: `Team achievement ${status.toLowerCase()} successfully` });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.getAllTeamAchievements = async (req, res) => {
  try {
    const { status, department } = req.query;
    const query = {};

    if (req.user.role === 'faculty') query.department = req.user.department;
    else if (department) query.department = department;

    if (status) query.status = status;

    const achievements = await TeamAchievement.find(query)
      .populate('teamMembers', 'name email rollNumber')
      .populate('uploadedBy', 'name email rollNumber')
      .populate('verifiedBy', 'name email')
      .sort('-createdAt');

    res.json({ success: true, count: achievements.length, data: achievements });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.deleteTeamAchievement = async (req, res) => {
  try {
    const achievement = await TeamAchievement.findById(req.params.id);
    if (!achievement) {
      return res.status(404).json({ success: false, message: 'Team achievement not found' });
    }

    if (achievement.uploadedBy.toString() !== req.user.id && req.user.role !== 'admin') {
      return res.status(403).json({ success: false, message: 'Not authorized' });
    }

    if (achievement.status === 'Approved' && achievement.points > 0) {
      const pointsPerMember = Math.floor(achievement.points / achievement.teamMembers.length);
      await User.updateMany(
        { _id: { $in: achievement.teamMembers } },
        { $inc: { totalScore: -pointsPerMember, achievementsCount: -1 } }
      );
    }

    await achievement.deleteOne();
    res.json({ success: true, message: 'Team achievement deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
