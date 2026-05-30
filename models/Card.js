const mongoose = require('mongoose');
const { CARD_STATUS } = require('../constants');

const CardSchema = new mongoose.Schema(
  {
    nickname: { type: String, required: true, trim: true },
    bankName: { type: String, required: true, trim: true },
    lastFourDigits: { type: String, required: true, match: /^\d{4}$/ },
    creditLimit: { type: Number, required: true, min: 0 },
    billingCycleStart: { type: Number, required: true, min: 1, max: 31 },
    billingCycleEnd: { type: Number, required: true, min: 1, max: 31 },
    dueDate: { type: Number, required: true, min: 1, max: 31 },
    availableBalance: { type: Number, default: 0, min: 0 },
    status: { type: String, enum: Object.values(CARD_STATUS), default: CARD_STATUS.ACTIVE },
    color: { type: String, default: '#1976d2' },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

CardSchema.virtual('utilizationPercent').get(function () {
  if (!this.creditLimit) return 0;
  const used = this.creditLimit - (this.availableBalance || 0);
  return Math.round((used / this.creditLimit) * 100);
});

CardSchema.set('toJSON', { virtuals: true });
CardSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('Card', CardSchema);
