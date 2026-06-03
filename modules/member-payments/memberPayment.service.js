const ApiError = require('../../utils/ApiError');
const { MemberPayment, FamilyMember } = require('../../models');

const create = async (data, userId) => {
  const member = await FamilyMember.findById(data.familyMemberId);
  if (!member) throw new ApiError(404, 'Family member not found');

  return MemberPayment.create({
    familyMember: data.familyMemberId,
    amount: data.amount,
    paymentDate: data.paymentDate || new Date(),
    method: data.method || 'upi',
    notes: data.notes,
    billingMonth: data.billingMonth,
    billingYear: data.billingYear,
    createdBy: userId,
  });
};

const list = async (query) => {
  const filter = {};
  if (query.familyMemberId) filter.familyMember = query.familyMemberId;
  if (query.month) filter.billingMonth = parseInt(query.month, 10);
  if (query.year) filter.billingYear = parseInt(query.year, 10);

  return MemberPayment.find(filter)
    .populate('familyMember', 'name phone relationship')
    .sort({ paymentDate: -1 });
};

const getById = async (id) => {
  const p = await MemberPayment.findById(id).populate('familyMember', 'name phone');
  if (!p) throw new ApiError(404, 'Payment not found');
  return p;
};

const remove = async (id) => {
  const p = await MemberPayment.findByIdAndDelete(id);
  if (!p) throw new ApiError(404, 'Payment not found');
  return { message: 'Payment deleted' };
};

module.exports = { create, list, getById, remove };
