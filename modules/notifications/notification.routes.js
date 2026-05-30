const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticateToken = require('../../middleware/authMiddleware');
const notificationController = require('./notification.controller');

const router = express.Router();
router.use(authenticateToken);

router.get('/', asyncHandler(notificationController.getNotifications));
router.patch('/read-all', asyncHandler(notificationController.markAllAsRead));
router.patch('/:id/read', asyncHandler(notificationController.markAsRead));

module.exports = router;
