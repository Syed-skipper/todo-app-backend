const { Expense, MemberPayment, FamilyMember, Card } = require('../../models');
const { getMonthRange } = require('../../utils/dateHelpers');
const { EXPENSE_STATUS } = require('../../constants');

const getDateFilter = (month, year) => {
  if (!month || !year) return {};
  const { start, end } = getMonthRange(month, year);
  return { expenseDate: { $gte: start, $lte: end } };
};

const getAssignedByMember = async (month, year, cardId) => {
  const match = { status: EXPENSE_STATUS.COMPLETED, ...getDateFilter(month, year) };
  if (cardId) match.card = cardId;

  const rows = await Expense.aggregate([
    { $match: match },
    { $unwind: '$allocations' },
    {
      $group: {
        _id: '$allocations.familyMember',
        totalAssigned: { $sum: '$allocations.amount' },
        transactionCount: { $sum: 1 },
      },
    },
  ]);

  const legacy = await Expense.aggregate([
    {
      $match: {
        ...match,
        $or: [{ allocations: { $exists: false } }, { allocations: { $size: 0 } }],
      },
    },
    { $group: { _id: null, unallocatedAmount: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

  return { rows, unallocated: legacy[0] || { unallocatedAmount: 0, count: 0 } };
};

const getPaymentsByMember = async (month, year) => {
  const filter = {};
  if (month && year) {
    filter.billingMonth = month;
    filter.billingYear = year;
  }
  return MemberPayment.aggregate([
    { $match: filter },
    { $group: { _id: '$familyMember', totalPaid: { $sum: '$amount' }, paymentCount: { $sum: 1 } } },
  ]);
};

const getOutstandingBalances = async (month, year) => {
  const [assigned, paid, members] = await Promise.all([
    getAssignedByMember(month, year),
    getPaymentsByMember(month, year),
    FamilyMember.find({ isActive: true }),
  ]);

  const paidMap = Object.fromEntries(paid.map((p) => [p._id?.toString(), p.totalPaid]));
  const assignedMap = Object.fromEntries(
    assigned.rows.map((r) => [r._id?.toString(), r])
  );

  const balances = members.map((m) => {
    const id = m._id.toString();
    const a = assignedMap[id]?.totalAssigned || 0;
    const p = paidMap[id] || 0;
    return {
      familyMember: m,
      totalAssigned: a,
      totalPaid: p,
      outstanding: Math.max(0, a - p),
      transactionCount: assignedMap[id]?.transactionCount || 0,
    };
  });

  return {
    balances: balances.sort((x, y) => y.outstanding - x.outstanding),
    unallocated: assigned.unallocated,
    period: month && year ? { month, year } : null,
  };
};

const getMonthlyStatement = async (month, year, cardId) => {
  const { start, end } = getMonthRange(month, year);
  const match = { expenseDate: { $gte: start, $lte: end }, status: EXPENSE_STATUS.COMPLETED };
  if (cardId) match.card = cardId;

  const expenses = await Expense.find(match)
    .populate('card', 'nickname bankName lastFourDigits')
    .populate('allocations.familyMember', 'name phone relationship')
    .sort({ expenseDate: -1 });

  const totalSpend = expenses.reduce((s, e) => s + e.amount, 0);
  let assignedTotal = 0;
  let unassignedTotal = 0;

  expenses.forEach((e) => {
    if (e.allocations?.length) {
      assignedTotal += e.allocations.reduce((s, a) => s + a.amount, 0);
    } else {
      unassignedTotal += e.amount;
    }
  });

  const byCard = await Expense.aggregate([
    { $match: match },
    { $group: { _id: '$card', total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);
  const cards = await Card.find({ _id: { $in: byCard.map((c) => c._id) } });
  const cardMap = Object.fromEntries(cards.map((c) => [c._id.toString(), c]));

  return {
    period: { month, year, start, end },
    expenses,
    totalSpend,
    assignedTotal,
    unassignedTotal,
    byCard: byCard.map((c) => ({
      card: cardMap[c._id?.toString()],
      total: c.total,
      count: c.count,
    })),
  };
};

const getMemberSettlementReport = async (memberId, month, year) => {
  const member = await FamilyMember.findById(memberId);
  if (!member) throw new (require('../../utils/ApiError'))(404, 'Family member not found');

  const { start, end } = getMonthRange(month, year);
  const expenses = await Expense.find({
    expenseDate: { $gte: start, $lte: end },
    status: EXPENSE_STATUS.COMPLETED,
    'allocations.familyMember': memberId,
  })
    .populate('card', 'nickname lastFourDigits')
    .sort({ expenseDate: -1 });

  const lineItems = [];
  expenses.forEach((e) => {
    e.allocations
      .filter((a) => a.familyMember?._id?.toString() === memberId || a.familyMember?.toString() === memberId)
      .forEach((a) => {
        lineItems.push({
          expenseId: e._id,
          date: e.expenseDate,
          merchant: e.merchant,
          category: e.category,
          card: e.card,
          amount: a.amount,
        });
      });
  });

  const totalAssigned = lineItems.reduce((s, i) => s + i.amount, 0);
  const payments = await MemberPayment.find({
    familyMember: memberId,
    billingMonth: month,
    billingYear: year,
  }).sort({ paymentDate: -1 });
  const totalPaid = payments.reduce((s, p) => s + p.amount, 0);

  return {
    member,
    period: { month, year },
    lineItems,
    totalAssigned,
    payments,
    totalPaid,
    outstanding: Math.max(0, totalAssigned - totalPaid),
  };
};

const generateWhatsAppMessage = async (memberId, month, year) => {
  const report = await getMemberSettlementReport(memberId, month, year);
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December',
  ];
  const periodLabel = `${monthNames[month - 1]} ${year}`;

  let lines = [
    `Hi ${report.member.name},`,
    '',
    `Your credit card expenses for ${periodLabel}:`,
    '',
  ];

  report.lineItems.forEach((item) => {
    lines.push(`${item.merchant} - ₹${item.amount.toLocaleString('en-IN')}`);
  });

  lines.push('');
  lines.push(`Total Due: ₹${report.outstanding.toLocaleString('en-IN')}`);
  if (report.totalPaid > 0) {
    lines.push(`(Assigned: ₹${report.totalAssigned.toLocaleString('en-IN')}, Already paid: ₹${report.totalPaid.toLocaleString('en-IN')})`);
  }
  lines.push('');
  lines.push('Please transfer the amount before the due date.');
  lines.push('');
  lines.push('Thank you.');

  const message = lines.join('\n');
  const phone = report.member.phone?.replace(/\D/g, '') || '';
  const waLink = phone ? `https://wa.me/${phone.startsWith('91') ? phone : `91${phone}`}?text=${encodeURIComponent(message)}` : null;

  return { message, waLink, report };
};

module.exports = {
  getOutstandingBalances,
  getMonthlyStatement,
  getMemberSettlementReport,
  generateWhatsAppMessage,
};
