const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const authController = require('./auth.controller');
const {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
} = require('./auth.validator');

const router = express.Router();

router.post('/register', registerValidator, validate, asyncHandler(authController.register));
router.post('/login', loginValidator, validate, asyncHandler(authController.login));

router.get('/profile', authenticateToken, asyncHandler(authController.getProfile));
router.put(
  '/profile',
  authenticateToken,
  updateProfileValidator,
  validate,
  asyncHandler(authController.updateProfile)
);
router.put(
  '/change-password',
  authenticateToken,
  changePasswordValidator,
  validate,
  asyncHandler(authController.changePassword)
);
router.get('/activity-logs', authenticateToken, asyncHandler(authController.getActivityLogs));

module.exports = router;
