const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticateToken = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const authRepository = require('../auth/auth.repository');
const { sendSuccess } = require('../../utils/response');
const ApiError = require('../../utils/ApiError');
const { User } = require('../../models');

const router = express.Router();
router.use(authenticateToken, requireAdmin);

router.get('/', asyncHandler(async (req, res) => {
  const users = await authRepository.findAll();
  sendSuccess(res, users);
}));

router.patch('/:id/status', asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(
    req.params.id,
    { isActive: req.body.isActive },
    { new: true }
  ).select('-password');
  if (!user) throw new ApiError(404, 'User not found');
  sendSuccess(res, user);
}));

module.exports = router;
