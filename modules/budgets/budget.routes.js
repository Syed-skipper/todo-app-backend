const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const budgetController = require('./budget.controller');
const { createBudgetValidator, idParamValidator } = require('./budget.validator');

const router = express.Router();
router.use(authenticateToken);

router.post('/', requireAdmin, createBudgetValidator, validate, asyncHandler(budgetController.createBudget));
router.get('/', asyncHandler(budgetController.listBudgets));
router.put('/:id', requireAdmin, idParamValidator, validate, asyncHandler(budgetController.updateBudget));
router.delete('/:id', requireAdmin, idParamValidator, validate, asyncHandler(budgetController.deleteBudget));

module.exports = router;
