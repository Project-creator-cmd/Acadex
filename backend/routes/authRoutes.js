const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authController = require('../controllers/authController');
const { protect } = require('../middleware/auth');

router.post('/register',
  [
    body('name').notEmpty().withMessage('Name is required'),
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
    body('department').notEmpty().withMessage('Department is required')
  ],
  authController.register
);

router.post('/login',
  [
    body('email').isEmail().withMessage('Valid email is required'),
    body('password').notEmpty().withMessage('Password is required')
  ],
  authController.login
);

router.get('/me', protect, authController.getMe);

router.put('/update-profile', protect, authController.updateProfile);

router.put('/change-password', protect, authController.changePassword);

module.exports = router;
