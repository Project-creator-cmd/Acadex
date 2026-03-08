const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');

router.get('/profile/:id', protect, userController.getUserProfile);
router.get('/students', protect, authorize('faculty', 'admin', 'placement'), userController.getStudents);

module.exports = router;
