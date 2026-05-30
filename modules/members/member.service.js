const mongoose = require('mongoose');
const ApiError = require('../../utils/ApiError');
const { getMonthRange, getCurrentMonthYear } = require('../../utils/dateHelpers');
const { User, Card } = require('../../models');
const memberRepository = require('./member.repository');

const getAllMembers = () => memberRepository.findAllMembers();

const getMemberDashboard = async (memberId, month, year) => {
  const member = await User.findById(memberId).select('-password');
  if (!member) throw new ApiError(404, 'Member not found');

  const { month: m, year: y } = getCurrentMonthYear();
  const { start, end } = getMonthRange(month || m, year || y);

  const [expenses, cardBreakdown, trends, familyRanking] = await Promise.all([
    memberRepository.getMemberExpenses(memberId, start, end),
    memberRepository.aggregateByCardForMember(
      new mongoose.Types.ObjectId(memberId),
      start,
      end
    ),
    memberRepository.aggregateTrends(memberId),
    memberRepository.aggregateMemberSpending(start, end),
  ]);

  const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
  const cards = await Card.find({ _id: { $in: cardBreakdown.map((c) => c._id) } });
  const cardMap = Object.fromEntries(cards.map((c) => [c._id.toString(), c]));

  return {
    member,
    period: { month: month || m, year: year || y, start, end },
    totalSpent,
    transactionCount: expenses.length,
    cardBreakdown: cardBreakdown.map((item) => ({
      card: cardMap[item._id?.toString()],
      total: item.total,
      count: item.count,
    })),
    monthlyTrends: trends,
    familyRank:
      familyRanking.findIndex((r) => r._id?.toString() === memberId) + 1,
    recentExpenses: expenses.slice(0, 10),
  };
};

const getMemberExpenseHistory = async (memberId, query, pagination) => {
  const filter = { member: memberId };
  if (query.startDate || query.endDate) {
    filter.expenseDate = {};
    if (query.startDate) filter.expenseDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.expenseDate.$lte = new Date(query.endDate);
  }
  const { Expense } = require('../../models');
  const [expenses, total] = await Promise.all([
    Expense.find(filter)
      .populate('card', 'nickname lastFourDigits')
      .sort(pagination.sort)
      .skip(pagination.skip)
      .limit(pagination.limit),
    Expense.countDocuments(filter),
  ]);
  return { expenses, total };
};

module.exports = { getAllMembers, getMemberDashboard, getMemberExpenseHistory };
