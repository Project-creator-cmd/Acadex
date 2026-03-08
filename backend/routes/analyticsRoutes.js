const express = require('express');
const router = express.Router();
const analyticsController = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

router.get('/dashboard', protect, authorize('admin', 'faculty', 'placement'), analyticsController.getDashboardStats);
router.get('/trends', protect, authorize('admin', 'faculty'), analyticsController.getAchievementTrends);
router.get('/leaderboard', protect, analyticsController.getLeaderboard);
router.get('/category-distribution', protect, authorize('admin', 'faculty'), analyticsController.getCategoryDistribution);
router.get('/performance-distribution', protect, authorize('admin', 'faculty'), analyticsController.getPerformanceDistribution);

module.exports = router;
