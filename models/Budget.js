const mongoose = require('mongoose');
const { BUDGET_TYPES, EXPENSE_CATEGORIES } = require('../constants');

const BudgetSchema = new mongoose.Schema(
  {
    type: { type: String, enum: Object.values(BUDGET_TYPES), required: true },
    amount: { type: Number, required: true, min: 1 },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card' },
    category: { type: String, enum: EXPENSE_CATEGORIES },
    alertThreshold: { type: Number, default: 80, min: 1, max: 100 },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

BudgetSchema.index({ type: 1, month: 1, year: 1 });

module.exports = mongoose.model('Budget', BudgetSchema);
