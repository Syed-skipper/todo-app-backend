const ApiError = require('../../utils/ApiError');
const { Expense, Notification } = require('../../models');
const { BUDGET_TYPES, NOTIFICATION_TYPES } = require('../../constants');
const { getMonthRange } = require('../../utils/dateHelpers');
const budgetRepository = require('./budget.repository');

const mapBudgetFields = (data) => ({
  type: data.type,
  amount: data.amount,
  month: data.month,
  year: data.year,
  member: data.memberId,
  card: data.cardId,
  category: data.category,
  alertThreshold: data.alertThreshold,
});

const getSpentForBudget = async (budget) => {
  const { start, end } = getMonthRange(budget.month, budget.year);
  const match = { expenseDate: { $gte: start, $lte: end }, status: 'completed' };

  if (budget.type === BUDGET_TYPES.MEMBER) match.member = budget.member;
  else if (budget.type === BUDGET_TYPES.CARD) match.card = budget.card;
  else if (budget.type === BUDGET_TYPES.CATEGORY) match.category = budget.category;

  const [result] = await Expense.aggregate([
    { $match: match },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  return result?.total || 0;
};

const enrichBudget = async (budget) => {
  const spent = await getSpentForBudget(budget);
  const percentUsed = Math.round((spent / budget.amount) * 100);
  const remaining = budget.amount - spent;
  const status =
    percentUsed >= 100 ? 'exceeded' : percentUsed >= budget.alertThreshold ? 'warning' : 'ok';

  if (status === 'exceeded' || status === 'warning') {
    await Notification.findOneAndUpdate(
      {
        type: NOTIFICATION_TYPES.BUDGET_EXCEEDED,
        'metadata.budgetId': budget._id,
        createdAt: { $gte: new Date(Date.now() - 24 * 60 * 60 * 1000) },
      },
      {
        user: budget.createdBy,
        type: NOTIFICATION_TYPES.BUDGET_EXCEEDED,
        title: status === 'exceeded' ? 'Budget exceeded' : 'Budget near limit',
        message: `Budget at ${percentUsed}% for ${budget.type}`,
        metadata: { budgetId: budget._id, percentUsed },
      },
      { upsert: true, new: true }
    );
  }

  return {
    ...budget.toObject(),
    spent,
    remaining,
    percentUsed,
    status,
  };
};

const createBudget = async (data, userId) => {
  const budget = await budgetRepository.create({
    ...mapBudgetFields(data),
    createdBy: userId,
  });
  return enrichBudget(budget);
};

const listBudgets = async (month, year) => {
  const filter = {};
  if (month) filter.month = month;
  if (year) filter.year = year;
  const budgets = await budgetRepository.findAll(filter);
  return Promise.all(budgets.map(enrichBudget));
};

const updateBudget = async (id, data) => {
  const budget = await budgetRepository.updateById(id, mapBudgetFields(data));
  if (!budget) throw new ApiError(404, 'Budget not found');
  return enrichBudget(budget);
};

const deleteBudget = async (id) => {
  const budget = await budgetRepository.deleteById(id);
  if (!budget) throw new ApiError(404, 'Budget not found');
  return { message: 'Budget deleted' };
};

module.exports = { createBudget, listBudgets, updateBudget, deleteBudget };
