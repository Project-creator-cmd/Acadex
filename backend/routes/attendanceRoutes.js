const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { protect, authorize } = require('../middleware/auth');

// Faculty routes
router.post('/recommend', protect, authorize('faculty'), attendanceController.recommendRelaxation);
router.get('/my-recommendations', protect, authorize('faculty'), attendanceController.getMyRecommendations);

// Admin routes
router.get('/pending', protect, authorize('admin'), attendanceController.getPendingRelaxations);
router.put('/:id/approve', protect, authorize('admin'), attendanceController.approveRelaxation);

// Student routes
router.get('/my-relaxations', protect, authorize('student'), attendanceController.getMyRelaxations);

// All
router.get('/', protect, attendanceController.getAllRelaxations);

module.exports = router;
