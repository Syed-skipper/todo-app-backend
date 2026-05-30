const { body, param } = require('express-validator');

const createEmiValidator = [
  body('title').trim().notEmpty(),
  body('purchaseAmount').isFloat({ min: 0 }),
  body('tenure').isInt({ min: 1 }),
  body('monthlyInstallment').isFloat({ min: 0 }),
  body('remainingInstallments').isInt({ min: 0 }),
  body('cardId').isMongoId(),
  body('memberId').isMongoId(),
  body('startDate').isISO8601(),
];

const idParamValidator = [param('id').isMongoId()];

module.exports = { createEmiValidator, idParamValidator };
