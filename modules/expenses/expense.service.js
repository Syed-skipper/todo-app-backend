const ApiError = require('../../utils/ApiError');
const { Card, Notification, FamilyMember } = require('../../models');
const { NOTIFICATION_TYPES, SPLIT_TYPES } = require('../../constants');
const { buildAllocations } = require('../../utils/allocationHelpers');
const expenseRepository = require('./expense.repository');
const cardService = require('../cards/card.service');

const resolveAllocations = async (data) => {
  const splitType = data.splitType || SPLIT_TYPES.SINGLE;
  const memberIds = data.memberIds || [];
  const customAllocations = data.allocations || [];

  if (data.familyMemberId && splitType === SPLIT_TYPES.SINGLE) {
    return buildAllocations(data.amount, SPLIT_TYPES.SINGLE, [], [
      { familyMemberId: data.familyMemberId },
    ]);
  }

  if (data.memberId && !data.familyMemberId) {
    const legacy = await FamilyMember.findOne({ _id: data.memberId });
    if (!legacy) {
      return buildAllocations(data.amount, SPLIT_TYPES.SINGLE, [], [
        { familyMemberId: data.memberId },
      ]);
    }
  }

  const members = memberIds.map((id) => ({ familyMemberId: id }));
  return buildAllocations(data.amount, splitType, members, customAllocations);
};

const notifyNewTransaction = async (expense, createdBy) => {
  await Notification.create({
    user: createdBy,
    type: NOTIFICATION_TYPES.NEW_TRANSACTION,
    title: 'New expense added',
    message: `₹${expense.amount} at ${expense.merchant}`,
    metadata: { expenseId: expense._id },
  }).catch(() => {});
};

const createExpense = async (data, userId) => {
  const card = await Card.findById(data.cardId);
  if (!card) throw new ApiError(404, 'Card not found');
  if (card.status === 'blocked') throw new ApiError(400, 'Card is blocked');

  const allocations = await resolveAllocations(data);
  if (!allocations?.length) throw new ApiError(400, 'Assign at least one family member');

  const expense = await expenseRepository.create({
    amount: data.amount,
    expenseDate: data.expenseDate || new Date(),
    card: data.cardId,
    splitType: data.splitType || SPLIT_TYPES.SINGLE,
    allocations,
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
  delete updateData.cardId;
  delete updateData.memberId;
  delete updateData.memberIds;
  delete updateData.familyMemberId;

  if (data.splitType || data.allocations || data.familyMemberId || data.memberIds) {
    const amount = data.amount ?? existing.amount;
    updateData.allocations = await resolveAllocations({ ...existing.toObject(), ...data, amount });
    updateData.splitType = data.splitType || existing.splitType;
  }

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
