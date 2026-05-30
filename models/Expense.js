const mongoose = require('mongoose');
const { EXPENSE_CATEGORIES, EXPENSE_STATUS, PAYMENT_MODES } = require('../constants');

const ExpenseSchema = new mongoose.Schema(
  {
    amount: { type: Number, required: true, min: 0.01 },
    expenseDate: { type: Date, required: true, default: Date.now },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    merchant: { type: String, required: true, trim: true },
    category: { type: String, enum: EXPENSE_CATEGORIES, required: true },
    notes: { type: String, trim: true },
    receiptUrl: { type: String },
    paymentMode: { type: String, enum: PAYMENT_MODES, default: 'credit_card' },
    status: { type: String, enum: Object.values(EXPENSE_STATUS), default: EXPENSE_STATUS.COMPLETED },
    emiPlan: { type: mongoose.Schema.Types.ObjectId, ref: 'EmiPlan' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

ExpenseSchema.index({ expenseDate: -1 });
ExpenseSchema.index({ card: 1, expenseDate: -1 });
ExpenseSchema.index({ member: 1, expenseDate: -1 });
ExpenseSchema.index({ category: 1 });
ExpenseSchema.index({ merchant: 'text', notes: 'text' });

module.exports = mongoose.model('Expense', ExpenseSchema);
