const express = require('express');
const router = express.Router();
const ctrl = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

// Must be before /:id routes
router.get('/students', protect, authorize('faculty', 'admin', 'placement'), ctrl.getStudents);

router.get('/:id/score', protect, ctrl.getUserScore);
router.get('/profile/:id', protect, ctrl.getUserProfile);

module.exports = router;
