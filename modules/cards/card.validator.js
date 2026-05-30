const { body, param } = require('express-validator');
const { CARD_STATUS } = require('../../constants');

const createCardValidator = [
  body('nickname').trim().notEmpty(),
  body('bankName').trim().notEmpty(),
  body('lastFourDigits').matches(/^\d{4}$/),
  body('creditLimit').isFloat({ min: 0 }),
  body('billingCycleStart').isInt({ min: 1, max: 31 }),
  body('billingCycleEnd').isInt({ min: 1, max: 31 }),
  body('dueDate').isInt({ min: 1, max: 31 }),
  body('availableBalance').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(Object.values(CARD_STATUS)),
];

const updateCardValidator = [
  param('id').isMongoId(),
  body('nickname').optional().trim().notEmpty(),
  body('bankName').optional().trim().notEmpty(),
  body('lastFourDigits').optional().matches(/^\d{4}$/),
  body('creditLimit').optional().isFloat({ min: 0 }),
  body('status').optional().isIn(Object.values(CARD_STATUS)),
];

const idParamValidator = [param('id').isMongoId()];

module.exports = { createCardValidator, updateCardValidator, idParamValidator };
