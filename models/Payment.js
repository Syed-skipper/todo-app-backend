const mongoose = require('mongoose');
const { PAYMENT_STATUS } = require('../constants');

const PaymentSchema = new mongoose.Schema(
  {
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    billingMonth: { type: Number, required: true, min: 1, max: 12 },
    billingYear: { type: Number, required: true },
    statementGenerated: { type: Boolean, default: false },
    amountDue: { type: Number, required: true, min: 0 },
    minimumDue: { type: Number, required: true, min: 0 },
    status: { type: String, enum: Object.values(PAYMENT_STATUS), default: PAYMENT_STATUS.PENDING },
    paidDate: { type: Date },
    paidAmount: { type: Number, min: 0 },
    dueDate: { type: Date, required: true },
    notes: { type: String },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

PaymentSchema.index({ card: 1, billingYear: -1, billingMonth: -1 });

module.exports = mongoose.model('Payment', PaymentSchema);
