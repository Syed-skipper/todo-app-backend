const { body, param } = require('express-validator');
const { PAYMENT_STATUS } = require('../../constants');

const createPaymentValidator = [
  body('cardId').isMongoId(),
  body('billingMonth').isInt({ min: 1, max: 12 }),
  body('billingYear').isInt({ min: 2020 }),
  body('amountDue').isFloat({ min: 0 }),
  body('minimumDue').isFloat({ min: 0 }),
  body('dueDate').isISO8601(),
  body('status').optional().isIn(Object.values(PAYMENT_STATUS)),
];

const markPaidValidator = [
  param('id').isMongoId(),
  body('paidAmount').isFloat({ min: 0 }),
  body('paidDate').optional().isISO8601(),
];

const idParamValidator = [param('id').isMongoId()];

module.exports = { createPaymentValidator, markPaidValidator, idParamValidator };
