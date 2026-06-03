const fs = require('fs');
const expenseService = require('./expense.service');
const { sendSuccess, sendPaginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const createExpense = async (req, res) => {
  const expense = await expenseService.createExpense(req.body, req.user.user_id);
  sendSuccess(res, expense, 'Expense created', 201);
};

const listExpenses = async (req, res) => {
  const pagination = getPagination(req.query);
  const { expenses, total } = await expenseService.listExpenses(req.query, pagination);
  sendPaginated(res, expenses, buildPaginationMeta(total, pagination.page, pagination.limit));
};

const getExpenseById = async (req, res) => {
  const expense = await expenseService.getExpenseById(req.params.id);
  sendSuccess(res, expense);
};

const updateExpense = async (req, res) => {
  const expense = await expenseService.updateExpense(req.params.id, req.body);
  sendSuccess(res, expense, 'Expense updated');
};

const deleteExpense = async (req, res) => {
  const result = await expenseService.deleteExpense(req.params.id);
  sendSuccess(res, result);
};

const importCsv = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'CSV file required' });
  }
  const importService = require('./expense.import.service');
  const results = await importService.importFromCsv(req.file.path, req.user.user_id);
  try {
    fs.unlinkSync(req.file.path);
  } catch {
    /* ignore */
  }
  sendSuccess(res, results, `Imported ${results.created} transactions`);
};

module.exports = {
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
  importCsv,
};
