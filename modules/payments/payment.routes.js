const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const paymentController = require('./payment.controller');
const { createPaymentValidator, markPaidValidator } = require('./payment.validator');

const router = express.Router();
router.use(authenticateToken);

router.post('/', requireAdmin, createPaymentValidator, validate, asyncHandler(paymentController.createPayment));
router.get('/', asyncHandler(paymentController.listPayments));
router.get('/upcoming', asyncHandler(paymentController.getUpcomingDue));
router.patch('/:id/pay', markPaidValidator, validate, asyncHandler(paymentController.markAsPaid));

module.exports = router;
