const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const memberController = require('./member.controller');
const { memberIdValidator, dashboardQueryValidator } = require('./member.validator');

const router = express.Router();
router.use(authenticateToken);

router.get('/', asyncHandler(memberController.getAllMembers));
router.get(
  '/:id/dashboard',
  memberIdValidator,
  dashboardQueryValidator,
  validate,
  asyncHandler(memberController.getMemberDashboard)
);
router.get(
  '/:id/expenses',
  memberIdValidator,
  validate,
  asyncHandler(memberController.getMemberExpenseHistory)
);

module.exports = router;
