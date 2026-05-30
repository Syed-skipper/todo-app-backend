const { Expense } = require('../../models');

const create = (data) => Expense.create(data);
const findById = (id) =>
  Expense.findById(id).populate('card', 'nickname bankName lastFourDigits').populate('member', 'name email');
const updateById = (id, data) =>
  Expense.findByIdAndUpdate(id, data, { new: true, runValidators: true })
    .populate('card', 'nickname bankName lastFourDigits')
    .populate('member', 'name email');
const deleteById = (id) => Expense.findByIdAndDelete(id);

const findWithFilters = (filter, { skip, limit, sort }) =>
  Expense.find(filter)
    .populate('card', 'nickname bankName lastFourDigits color')
    .populate('member', 'name email')
    .sort(sort)
    .skip(skip)
    .limit(limit);

const countWithFilters = (filter) => Expense.countDocuments(filter);

const buildFilter = (query) => {
  const filter = {};
  if (query.cardId) filter.card = query.cardId;
  if (query.memberId) filter.member = query.memberId;
  if (query.category) filter.category = query.category;
  if (query.status) filter.status = query.status;
  if (query.startDate || query.endDate) {
    filter.expenseDate = {};
    if (query.startDate) filter.expenseDate.$gte = new Date(query.startDate);
    if (query.endDate) filter.expenseDate.$lte = new Date(query.endDate);
  }
  if (query.minAmount || query.maxAmount) {
    filter.amount = {};
    if (query.minAmount) filter.amount.$gte = parseFloat(query.minAmount);
    if (query.maxAmount) filter.amount.$lte = parseFloat(query.maxAmount);
  }
  if (query.search) {
    filter.$or = [
      { merchant: { $regex: query.search, $options: 'i' } },
      { notes: { $regex: query.search, $options: 'i' } },
    ];
  }
  return filter;
};

module.exports = {
  create,
  findById,
  updateById,
  deleteById,
  findWithFilters,
  countWithFilters,
  buildFilter,
};
