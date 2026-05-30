const { body, param } = require('express-validator');
const { BUDGET_TYPES, EXPENSE_CATEGORIES } = require('../../constants');

const createBudgetValidator = [
  body('type').isIn(Object.values(BUDGET_TYPES)),
  body('amount').isFloat({ min: 1 }),
  body('month').isInt({ min: 1, max: 12 }),
  body('year').isInt({ min: 2020 }),
  body('memberId').optional().isMongoId(),
  body('cardId').optional().isMongoId(),
  body('category').optional().isIn(EXPENSE_CATEGORIES),
  body('alertThreshold').optional().isInt({ min: 1, max: 100 }),
];

const idParamValidator = [param('id').isMongoId()];

module.exports = { createBudgetValidator, idParamValidator };
