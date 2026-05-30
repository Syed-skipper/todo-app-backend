const mongoose = require('mongoose');
const { Expense, Card, User, Budget } = require('../../models');
const { getMonthRange, getCurrentMonthYear } = require('../../utils/dateHelpers');
const memberRepository = require('../members/member.repository');

const getMonthlyDashboard = async (month, year) => {
  const { month: m, year: y } = getCurrentMonthYear();
  const targetMonth = month || m;
  const targetYear = year || y;
  const { start, end } = getMonthRange(targetMonth, targetYear);

  const [
    totalResult,
    categoryBreakdown,
    memberSpending,
    cardUsage,
    dailyTrend,
    budgets,
  ] = await Promise.all([
    Expense.aggregate([
      { $match: { expenseDate: { $gte: start, $lte: end }, status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: start, $lte: end }, status: 'completed' } },
      { $group: { _id: '$category', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    memberRepository.aggregateMemberSpending(start, end),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: start, $lte: end }, status: 'completed' } },
      { $group: { _id: '$card', total: { $sum: '$amount' }, count: { $sum: 1 } } },
      { $sort: { total: -1 } },
    ]),
    Expense.aggregate([
      { $match: { expenseDate: { $gte: start, $lte: end }, status: 'completed' } },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m-%d', date: '$expenseDate' } },
          total: { $sum: '$amount' },
        },
      },
      { $sort: { _id: 1 } },
    ]),
    Budget.find({ month: targetMonth, year: targetYear }),
  ]);

  const members = await User.find({ _id: { $in: memberSpending.map((m) => m._id) } }).select('name');
  const cards = await Card.find({ _id: { $in: cardUsage.map((c) => c._id) } });
  const memberMap = Object.fromEntries(members.map((m) => [m._id.toString(), m]));
  const cardMap = Object.fromEntries(cards.map((c) => [c._id.toString(), c]));

  const totalFamilySpend = totalResult[0]?.total || 0;
  const highestSpender = memberSpending[0]
    ? { member: memberMap[memberSpending[0]._id?.toString()], amount: memberSpending[0].totalSpent }
    : null;
  const mostUsedCard = cardUsage[0]
    ? { card: cardMap[cardUsage[0]._id?.toString()], amount: cardUsage[0].total }
    : null;

  const overallBudget = budgets.find((b) => b.type === 'overall');
  const budgetVsActual = overallBudget
    ? {
        budget: overallBudget.amount,
        actual: totalFamilySpend,
        remaining: overallBudget.amount - totalFamilySpend,
        percentUsed: Math.round((totalFamilySpend / overallBudget.amount) * 100),
      }
    : null;

  return {
    period: { month: targetMonth, year: targetYear },
    totalFamilySpend,
    transactionCount: totalResult[0]?.count || 0,
    highestSpender,
    mostUsedCard,
    categoryBreakdown,
    memberSpending: memberSpending.map((m) => ({
      member: memberMap[m._id?.toString()],
      total: m.totalSpent,
      count: m.transactionCount,
    })),
    cardUsage: cardUsage.map((c) => ({
      card: cardMap[c._id?.toString()],
      total: c.total,
      count: c.count,
    })),
    dailyTrend,
    budgetVsActual,
  };
};

const getSmartInsights = async () => {
  const sixMonthsAgo = new Date();
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

  const monthlyTotals = await Expense.aggregate([
    { $match: { expenseDate: { $gte: sixMonthsAgo }, status: 'completed' } },
    {
      $group: {
        _id: { year: { $year: '$expenseDate' }, month: { $month: '$expenseDate' } },
        total: { $sum: '$amount' },
      },
    },
    { $sort: { '_id.year': 1, '_id.month': 1 } },
  ]);

  const avgMonthly =
    monthlyTotals.length > 0
      ? monthlyTotals.reduce((s, m) => s + m.total, 0) / monthlyTotals.length
      : 0;
  const lastMonth = monthlyTotals[monthlyTotals.length - 1]?.total || 0;
  const prediction = Math.round(avgMonthly * 1.05);

  const recurring = await Expense.aggregate([
    { $match: { expenseDate: { $gte: sixMonthsAgo }, status: 'completed' } },
    {
      $group: {
        _id: { merchant: '$merchant', category: '$category' },
        count: { $sum: 1 },
        avgAmount: { $avg: '$amount' },
        total: { $sum: '$amount' },
      },
    },
    { $match: { count: { $gte: 3 } } },
    { $sort: { count: -1 } },
    { $limit: 10 },
  ]);

  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  const categoryAvg = await Expense.aggregate([
    { $match: { expenseDate: { $gte: thirtyDaysAgo }, status: 'completed' } },
    { $group: { _id: '$category', avg: { $avg: '$amount' }, max: { $max: '$amount' } } },
  ]);
  const avgMap = Object.fromEntries(categoryAvg.map((c) => [c._id, c]));

  const recentExpenses = await Expense.find({
    expenseDate: { $gte: thirtyDaysAgo },
    status: 'completed',
  }).limit(200);

  const unusual = recentExpenses
    .filter((e) => {
      const stats = avgMap[e.category];
      return stats && e.amount > stats.avg * 2.5;
    })
    .slice(0, 5)
    .map((e) => ({
      expenseId: e._id,
      merchant: e.merchant,
      amount: e.amount,
      category: e.category,
      reason: 'Amount significantly above category average',
    }));

  const savingsSuggestions = [];
  if (lastMonth > avgMonthly * 1.15) {
    savingsSuggestions.push({
      type: 'overspend',
      message: 'Last month spending was 15%+ above your 6-month average. Review discretionary categories.',
    });
  }
  const topCategory = await Expense.aggregate([
    { $match: { expenseDate: { $gte: thirtyDaysAgo } } },
    { $group: { _id: '$category', total: { $sum: '$amount' } } },
    { $sort: { total: -1 } },
    { $limit: 1 },
  ]);
  if (topCategory[0]) {
    savingsSuggestions.push({
      type: 'category_focus',
      message: `Highest spend category: ${topCategory[0]._id}. Consider setting a stricter budget.`,
    });
  }

  return {
    spendingPrediction: { nextMonthEstimate: prediction, basedOnAverage: avgMonthly },
    recurringPayments: recurring,
    unusualExpenses: unusual,
    savingsSuggestions,
  };
};

module.exports = { getMonthlyDashboard, getSmartInsights };
