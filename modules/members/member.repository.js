const { User, Expense } = require('../../models');

const findAllMembers = () =>
  User.find({ isActive: true }).select('-password').sort({ name: 1 });

const getMemberExpenses = (memberId, start, end) =>
  Expense.find({
    member: memberId,
    expenseDate: { $gte: start, $lte: end },
    status: 'completed',
  })
    .populate('card', 'nickname lastFourDigits')
    .sort({ expenseDate: -1 });

const aggregateMemberSpending = (start, end) =>
  Expense.aggregate([
    {
      $match: {
        expenseDate: { $gte: start, $lte: end },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$member',
        totalSpent: { $sum: '$amount' },
        transactionCount: { $sum: 1 },
      },
    },
    { $sort: { totalSpent: -1 } },
  ]);

const aggregateByCardForMember = (memberId, start, end) =>
  Expense.aggregate([
    {
      $match: {
        member: memberId,
        expenseDate: { $gte: start, $lte: end },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: '$card',
        total: { $sum: '$amount' },
        count: { $sum: 1 },
      },
    },
  ]);

const aggregateTrends = (memberId, months = 6) => {
  const start = new Date();
  start.setMonth(start.getMonth() - months);
  return Expense.aggregate([
    {
      $match: {
        member: memberId,
        expenseDate: { $gte: start },
        status: 'completed',
      },
    },
    {
      $group: {
        _id: {
          year: { $year: '$expenseDate' },
          month: { $month: '$expenseDate' },
        },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);
};

module.exports = {
  findAllMembers,
  getMemberExpenses,
  aggregateMemberSpending,
  aggregateByCardForMember,
  aggregateTrends,
};
