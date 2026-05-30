const { Card, Expense } = require('../../models');

const create = (data) => Card.create(data);
const findAll = (filter = {}) => Card.find(filter).sort({ createdAt: -1 });
const findById = (id) => Card.findById(id);
const updateById = (id, data) => Card.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Card.findByIdAndDelete(id);

const getCardExpensesInRange = (cardId, start, end) =>
  Expense.aggregate([
    {
      $match: {
        card: cardId,
        expenseDate: { $gte: start, $lte: end },
        status: 'completed',
      },
    },
    { $group: { _id: null, total: { $sum: '$amount' }, count: { $sum: 1 } } },
  ]);

module.exports = {
  create,
  findAll,
  findById,
  updateById,
  deleteById,
  getCardExpensesInRange,
};
