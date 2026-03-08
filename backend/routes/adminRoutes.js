const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { protect, authorize } = require('../middleware/auth');

router.use(protect);
router.use(authorize('admin'));

router.get('/users', adminController.getAllUsers);
router.post('/users', adminController.createUser);
router.put('/users/:id', adminController.updateUser);
router.delete('/users/:id', adminController.deleteUser);
router.put('/users/:id/toggle-status', adminController.toggleUserStatus);

router.get('/scoring-rules', adminController.getScoringRules);
router.post('/scoring-rules', adminController.createScoringRule);
router.put('/scoring-rules/:id', adminController.updateScoringRule);

router.get('/reports/batch', adminController.getBatchReport);
router.get('/reports/department', adminController.getDepartmentReport);

module.exports = router;
