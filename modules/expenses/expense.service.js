const ApiError = require('../../utils/ApiError');
const { Card, Notification } = require('../../models');
const { NOTIFICATION_TYPES } = require('../../constants');
const expenseRepository = require('./expense.repository');
const cardService = require('../cards/card.service');

const notifyNewTransaction = async (expense, createdBy) => {
  const users = await require('../../models').User.find({ isActive: true }).select('_id');
  const notifications = users
    .filter((u) => u._id.toString() !== createdBy)
    .map((u) => ({
      user: u._id,
      type: NOTIFICATION_TYPES.NEW_TRANSACTION,
      title: 'New expense added',
      message: `₹${expense.amount} at ${expense.merchant}`,
      metadata: { expenseId: expense._id },
    }));
  if (notifications.length) await Notification.insertMany(notifications);
};

const createExpense = async (data, userId) => {
  const card = await Card.findById(data.cardId);
  if (!card) throw new ApiError(404, 'Card not found');
  if (card.status === 'blocked') throw new ApiError(400, 'Card is blocked');

  const expense = await expenseRepository.create({
    amount: data.amount,
    expenseDate: data.expenseDate || new Date(),
    card: data.cardId,
    member: data.memberId,
    merchant: data.merchant,
    category: data.category,
    notes: data.notes,
    receiptUrl: data.receiptUrl,
    paymentMode: data.paymentMode,
    status: data.status || 'completed',
    createdBy: userId,
  });

  if (card.availableBalance !== undefined) {
    card.availableBalance = Math.max(0, (card.availableBalance ?? card.creditLimit) - data.amount);
    await card.save();

    const used = card.creditLimit - card.availableBalance;
    const utilization = (used / card.creditLimit) * 100;
    if (utilization >= 80) {
      await Notification.create({
        user: userId,
        type: NOTIFICATION_TYPES.CARD_LIMIT,
        title: 'Card nearing limit',
        message: `${card.nickname} is at ${Math.round(utilization)}% utilization`,
        metadata: { cardId: card._id },
      });
    }
  }

  const populated = await expenseRepository.findById(expense._id);
  await notifyNewTransaction(populated, userId);
  return populated;
};

const listExpenses = async (query, pagination) => {
  const filter = expenseRepository.buildFilter(query);
  const [expenses, total] = await Promise.all([
    expenseRepository.findWithFilters(filter, pagination),
    expenseRepository.countWithFilters(filter),
  ]);
  return { expenses, total };
};

const getExpenseById = async (id) => {
  const expense = await expenseRepository.findById(id);
  if (!expense) throw new ApiError(404, 'Expense not found');
  return expense;
};

const updateExpense = async (id, data) => {
  const existing = await expenseRepository.findById(id);
  if (!existing) throw new ApiError(404, 'Expense not found');

  const updateData = { ...data };
  if (data.cardId) updateData.card = data.cardId;
  if (data.memberId) updateData.member = data.memberId;
  delete updateData.cardId;
  delete updateData.memberId;

  const expense = await expenseRepository.updateById(id, updateData);
  if (data.amount && existing.card) {
    await cardService.syncCardBalance(existing.card._id || existing.card);
  }
  return expense;
};

const deleteExpense = async (id) => {
  const expense = await expenseRepository.findById(id);
  if (!expense) throw new ApiError(404, 'Expense not found');
  await expenseRepository.deleteById(id);
  if (expense.card) {
    await cardService.syncCardBalance(expense.card._id || expense.card);
  }
  return { message: 'Expense deleted' };
};

module.exports = {
  createExpense,
  listExpenses,
  getExpenseById,
  updateExpense,
  deleteExpense,
};
