const { body, param, query } = require('express-validator');
const { EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_MODES } = require('../../constants');

const createExpenseValidator = [
  body('amount').isFloat({ min: 0.01 }),
  body('cardId').isMongoId(),
  body('memberId').isMongoId(),
  body('merchant').trim().notEmpty(),
  body('category').isIn(EXPENSE_CATEGORIES),
  body('expenseDate').optional().isISO8601(),
  body('notes').optional().isString(),
  body('paymentMode').optional().isIn(PAYMENT_MODES),
  body('status').optional().isIn(Object.values(EXPENSE_STATUS)),
];

const updateExpenseValidator = [
  param('id').isMongoId(),
  body('amount').optional().isFloat({ min: 0.01 }),
  body('category').optional().isIn(EXPENSE_CATEGORIES),
  body('merchant').optional().trim().notEmpty(),
];

const listExpenseValidator = [
  query('page').optional().isInt({ min: 1 }),
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('cardId').optional().isMongoId(),
  query('memberId').optional().isMongoId(),
  query('category').optional().isIn(EXPENSE_CATEGORIES),
  query('startDate').optional().isISO8601(),
  query('endDate').optional().isISO8601(),
  query('search').optional().isString(),
  query('minAmount').optional().isFloat({ min: 0 }),
  query('maxAmount').optional().isFloat({ min: 0 }),
];

const idParamValidator = [param('id').isMongoId()];

module.exports = {
  createExpenseValidator,
  updateExpenseValidator,
  listExpenseValidator,
  idParamValidator,
};
