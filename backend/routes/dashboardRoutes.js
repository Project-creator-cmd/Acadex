const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/dashboardController');
const { protect, authorize } = require('../middleware/auth');

router.get('/student', protect, authorize('student'), ctrl.getStudentDashboard);
router.get('/admin', protect, authorize('admin'), ctrl.getAdminDashboard);
router.get('/placement', protect, authorize('admin', 'placement'), ctrl.getPlacementDashboard);

module.exports = router;
