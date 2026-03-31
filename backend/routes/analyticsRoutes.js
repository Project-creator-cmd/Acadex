const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/analyticsController');
const { protect, authorize } = require('../middleware/auth');

// Leaderboard accessible to all authenticated roles
router.get('/leaderboard', protect, ctrl.getLeaderboard);

router.get('/dashboard', protect, authorize('admin', 'faculty', 'placement'), ctrl.getDashboardStats);
router.get('/trends', protect, authorize('admin', 'faculty'), ctrl.getAchievementTrends);
router.get('/department-performance', protect, authorize('admin', 'faculty', 'placement'), ctrl.getDepartmentPerformance);
router.get('/type-distribution', protect, authorize('admin', 'faculty'), ctrl.getTypeDistribution);
router.get('/category-distribution', protect, authorize('admin', 'faculty'), ctrl.getCategoryDistribution);
router.get('/performance-distribution', protect, authorize('admin', 'faculty'), ctrl.getPerformanceDistribution);

module.exports = router;
