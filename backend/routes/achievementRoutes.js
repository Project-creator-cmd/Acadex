const express = require('express');
const router = express.Router();
const achievementController = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// Student routes
router.post('/', protect, authorize('student', 'faculty'), upload.single('certificate'), achievementController.createAchievement);
router.get('/my-achievements', protect, achievementController.getMyAchievements);
router.get('/:id', protect, achievementController.getAchievementById);
router.delete('/:id', protect, achievementController.deleteAchievement);

// Faculty/Admin routes
router.get('/', protect, authorize('faculty', 'admin', 'placement'), achievementController.getAllAchievements);
router.put('/:id/verify', protect, authorize('faculty', 'admin'), achievementController.verifyAchievement);
router.get('/pending/list', protect, authorize('faculty', 'admin'), achievementController.getPendingAchievements);

module.exports = router;
