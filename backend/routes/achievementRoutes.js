const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/achievementController');
const { protect, authorize } = require('../middleware/auth');
const upload = require('../middleware/upload');

// ─── STATIC ROUTES (must be before /:id) ────────────────────────────────────
router.get('/my-achievements', protect, ctrl.getMyAchievements);

// Both paths point to the same controller — /pending for spec compliance,
// /pending/list kept for backward compat with existing frontend calls
router.get('/pending', protect, authorize('faculty', 'admin'), ctrl.getPendingAchievements);
router.get('/pending/list', protect, authorize('faculty', 'admin'), ctrl.getPendingAchievements);

router.post('/', protect, authorize('student', 'faculty'), upload.single('certificate'), ctrl.createAchievement);
router.get('/', protect, authorize('faculty', 'admin', 'placement'), ctrl.getAllAchievements);

// ─── DYNAMIC ROUTES (must be last) ──────────────────────────────────────────
router.get('/:id', protect, ctrl.getAchievementById);
router.put('/:id/verify', protect, authorize('faculty', 'admin'), ctrl.verifyAchievement);
router.delete('/:id', protect, ctrl.deleteAchievement);

module.exports = router;
