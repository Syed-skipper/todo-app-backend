const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticateToken = require('../../middleware/authMiddleware');
const controller = require('./settlement.controller');

const router = express.Router();
router.use(authenticateToken);

router.get('/balances', asyncHandler(controller.getBalances));
router.get('/statement', asyncHandler(controller.getStatement));
router.get('/member/:memberId/report', asyncHandler(controller.getMemberReport));
router.get('/member/:memberId/whatsapp', asyncHandler(controller.getWhatsApp));

module.exports = router;
