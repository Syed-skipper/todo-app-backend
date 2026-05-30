const PDFDocument = require('pdfkit');
const { Expense, User, Card } = require('../../models');
const { getMonthRange, getCurrentMonthYear } = require('../../utils/dateHelpers');

const fetchReportData = async (month, year, filters = {}) => {
  const { month: m, year: y } = getCurrentMonthYear();
  const { start, end } = getMonthRange(month || m, year || y);
  const match = { expenseDate: { $gte: start, $lte: end }, status: 'completed' };
  if (filters.memberId) match.member = filters.memberId;
  if (filters.cardId) match.card = filters.cardId;

  const expenses = await Expense.find(match)
    .populate('member', 'name email')
    .populate('card', 'nickname bankName lastFourDigits')
    .sort({ expenseDate: -1 });

  const total = expenses.reduce((s, e) => s + e.amount, 0);
  return { expenses, total, period: { month: month || m, year: year || y, start, end } };
};

const expensesToCsv = (expenses) => {
  const headers = ['Date', 'Member', 'Card', 'Merchant', 'Category', 'Amount', 'Notes'];
  const rows = expenses.map((e) => [
    new Date(e.expenseDate).toISOString().split('T')[0],
    e.member?.name || '',
    e.card ? `${e.card.nickname} (*${e.card.lastFourDigits})` : '',
    e.merchant,
    e.category,
    e.amount,
    (e.notes || '').replace(/,/g, ';'),
  ]);
  return [headers, ...rows].map((r) => r.join(',')).join('\n');
};

const generateMonthlyPdf = async (month, year) => {
  const { expenses, total, period } = await fetchReportData(month, year);
  const doc = new PDFDocument({ margin: 50 });
  const chunks = [];
  doc.on('data', (chunk) => chunks.push(chunk));

  doc.fontSize(20).text('Family Expense Report', { align: 'center' });
  doc.moveDown();
  doc.fontSize(12).text(`Period: ${period.month}/${period.year}`);
  doc.text(`Total Spend: ₹${total.toLocaleString('en-IN')}`);
  doc.text(`Transactions: ${expenses.length}`);
  doc.moveDown();

  expenses.slice(0, 100).forEach((e) => {
    doc
      .fontSize(10)
      .text(
        `${new Date(e.expenseDate).toLocaleDateString()} | ${e.member?.name} | ${e.merchant} | ${e.category} | ₹${e.amount}`
      );
  });

  doc.end();
  return new Promise((resolve) => {
    doc.on('end', () => resolve(Buffer.concat(chunks)));
  });
};

const exportCsv = async (month, year, filters) => {
  const { expenses } = await fetchReportData(month, year, filters);
  return expensesToCsv(expenses);
};

const getMemberSpendingReport = async (memberId, month, year) => {
  const member = await User.findById(memberId).select('name email');
  const data = await fetchReportData(month, year, { memberId });
  const byCategory = {};
  data.expenses.forEach((e) => {
    byCategory[e.category] = (byCategory[e.category] || 0) + e.amount;
  });
  return { member, ...data, byCategory };
};

const getCardStatementSummary = async (cardId, month, year) => {
  const card = await Card.findById(cardId);
  const data = await fetchReportData(month, year, { cardId });
  return { card, ...data };
};

module.exports = {
  generateMonthlyPdf,
  exportCsv,
  getMemberSpendingReport,
  getCardStatementSummary,
};
