const mongoose = require('mongoose');
const { MEMBER_PAYMENT_METHODS } = require('../constants');

const MemberPaymentSchema = new mongoose.Schema(
  {
    familyMember: { type: mongoose.Schema.Types.ObjectId, ref: 'FamilyMember', required: true },
    amount: { type: Number, required: true, min: 0.01 },
    paymentDate: { type: Date, required: true, default: Date.now },
    method: { type: String, enum: MEMBER_PAYMENT_METHODS, default: 'upi' },
    notes: { type: String, trim: true },
    billingMonth: { type: Number, min: 1, max: 12 },
    billingYear: { type: Number },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

MemberPaymentSchema.index({ familyMember: 1, paymentDate: -1 });

module.exports = mongoose.model('MemberPayment', MemberPaymentSchema);
