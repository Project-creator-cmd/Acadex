const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/teamAchievementController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.post('/upload', protect, authorize('student', 'faculty'), upload.single('certificate'), ctrl.uploadTeamAchievement);
router.get('/flagged', protect, authorize('faculty', 'admin'), ctrl.getFlaggedAchievements);
router.get('/student/:id', protect, ctrl.getStudentTeamAchievements);
router.get('/', protect, authorize('faculty', 'admin', 'placement'), ctrl.getAllTeamAchievements);
router.put('/:id/verify', protect, authorize('faculty', 'admin'), ctrl.verifyTeamAchievement);
router.delete('/:id', protect, ctrl.deleteTeamAchievement);

module.exports = router;
