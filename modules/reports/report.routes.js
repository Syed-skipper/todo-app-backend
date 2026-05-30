const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticateToken = require('../../middleware/authMiddleware');
const reportController = require('./report.controller');

const router = express.Router();
router.use(authenticateToken);

router.get('/monthly/pdf', asyncHandler(reportController.exportMonthlyPdf));
router.get('/export/csv', asyncHandler(reportController.exportCsv));
router.get('/member/:memberId', asyncHandler(reportController.getMemberReport));
router.get('/card/:cardId/statement', asyncHandler(reportController.getCardStatement));

module.exports = router;
