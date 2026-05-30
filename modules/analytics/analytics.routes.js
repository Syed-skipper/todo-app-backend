const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticateToken = require('../../middleware/authMiddleware');
const analyticsController = require('./analytics.controller');

const router = express.Router();
router.use(authenticateToken);

router.get('/dashboard', asyncHandler(analyticsController.getMonthlyDashboard));
router.get('/insights', asyncHandler(analyticsController.getSmartInsights));

module.exports = router;
