const ApiError = require('../../utils/ApiError');
const { getMonthRange, getCurrentMonthYear, getBillingCycleRange } = require('../../utils/dateHelpers');
const cardRepository = require('./card.repository');
const { Expense } = require('../../models');

const createCard = async (data, userId) => {
  return cardRepository.create({ ...data, createdBy: userId });
};

const getAllCards = () => cardRepository.findAll();

const getCardById = async (id) => {
  const card = await cardRepository.findById(id);
  if (!card) throw new ApiError(404, 'Card not found');
  return card;
};

const updateCard = async (id, data) => {
  const card = await cardRepository.updateById(id, data);
  if (!card) throw new ApiError(404, 'Card not found');
  return card;
};

const deleteCard = async (id) => {
  const expenseCount = await Expense.countDocuments({ card: id });
  if (expenseCount > 0) {
    throw new ApiError(400, 'Cannot delete card with existing expenses');
  }
  const card = await cardRepository.deleteById(id);
  if (!card) throw new ApiError(404, 'Card not found');
  return { message: 'Card deleted successfully' };
};

const getCardSummary = async (id, month, year) => {
  const card = await getCardById(id);
  const { month: m, year: y } = getCurrentMonthYear();
  const targetMonth = month || m;
  const targetYear = year || y;

  const { start, end } = getBillingCycleRange(card, targetMonth, targetYear);
  const [cycleStats] = await cardRepository.getCardExpensesInRange(id, start, end);
  const totalSpent = cycleStats?.total || 0;
  const transactionCount = cycleStats?.count || 0;
  const used = card.creditLimit - (card.availableBalance ?? card.creditLimit);
  const utilization = card.creditLimit
    ? Math.round((used / card.creditLimit) * 100)
    : 0;

  const upcomingDue = await require('../../models').Payment.findOne({
    card: id,
    status: { $in: ['pending', 'overdue'] },
  }).sort({ dueDate: 1 });

  return {
    card,
    billingCycle: { start, end },
    totalSpent,
    transactionCount,
    remainingBalance: card.availableBalance,
    utilizationPercent: utilization,
    upcomingDue,
  };
};

const syncCardBalance = async (cardId) => {
  const card = await getCardById(cardId);
  const totalSpent = await Expense.aggregate([
    { $match: { card: card._id, status: 'completed' } },
    { $group: { _id: null, total: { $sum: '$amount' } } },
  ]);
  const spent = totalSpent[0]?.total || 0;
  card.availableBalance = Math.max(0, card.creditLimit - spent);
  await card.save();
  return card;
};

const getAllCardsWithSummaries = async (month, year) => {
  const cards = await getAllCards();
  const summaries = await Promise.all(
    cards.map((card) =>
      getCardSummary(card._id, month, year).then((summary) => ({
        cardId: card._id,
        ...summary,
      }))
    )
  );
  return { cards, summaries };
};

module.exports = {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
  getCardSummary,
  getAllCardsWithSummaries,
  syncCardBalance,
};
