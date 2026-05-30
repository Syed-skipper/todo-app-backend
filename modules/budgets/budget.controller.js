const budgetService = require('./budget.service');
const { sendSuccess } = require('../../utils/response');

const createBudget = async (req, res) => {
  const budget = await budgetService.createBudget(req.body, req.user.user_id);
  sendSuccess(res, budget, 'Budget created', 201);
};

const listBudgets = async (req, res) => {
  const budgets = await budgetService.listBudgets(
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, budgets);
};

const updateBudget = async (req, res) => {
  const budget = await budgetService.updateBudget(req.params.id, req.body);
  sendSuccess(res, budget, 'Budget updated');
};

const deleteBudget = async (req, res) => {
  const result = await budgetService.deleteBudget(req.params.id);
  sendSuccess(res, result);
};

module.exports = { createBudget, listBudgets, updateBudget, deleteBudget };
