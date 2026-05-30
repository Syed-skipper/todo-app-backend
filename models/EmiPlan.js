const mongoose = require('mongoose');

const EmiPlanSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, trim: true },
    purchaseAmount: { type: Number, required: true, min: 0 },
    tenure: { type: Number, required: true, min: 1 },
    monthlyInstallment: { type: Number, required: true, min: 0 },
    remainingInstallments: { type: Number, required: true, min: 0 },
    card: { type: mongoose.Schema.Types.ObjectId, ref: 'Card', required: true },
    member: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    startDate: { type: Date, required: true },
    merchant: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('EmiPlan', EmiPlanSchema);
