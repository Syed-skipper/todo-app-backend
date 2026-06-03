const ApiError = require('./ApiError');
const { SPLIT_TYPES } = require('../constants');

const round2 = (n) => Math.round(n * 100) / 100;

const buildAllocations = (totalAmount, splitType, members, customAllocations = []) => {
  const amount = parseFloat(totalAmount);
  if (!amount || amount <= 0) throw new ApiError(400, 'Invalid amount');

  if (splitType === SPLIT_TYPES.SINGLE) {
    const m = members[0] || customAllocations[0];
    if (!m?.familyMemberId && !m?.familyMember) {
      throw new ApiError(400, 'Select a family member');
    }
    const id = m.familyMemberId || m.familyMember;
    return [{ familyMember: id, amount, percent: 100 }];
  }

  if (splitType === SPLIT_TYPES.EQUAL) {
    if (!members.length) throw new ApiError(400, 'Select at least one member for split');
    const share = round2(amount / members.length);
    let remainder = round2(amount - share * members.length);
    return members.map((m, i) => {
      const id = m.familyMemberId || m.familyMember || m;
      const extra = i === 0 ? remainder : 0;
      return { familyMember: id, amount: round2(share + extra), percent: round2(100 / members.length) };
    });
  }

  if (splitType === SPLIT_TYPES.PERCENT) {
    const totalPct = customAllocations.reduce((s, a) => s + parseFloat(a.percent || 0), 0);
    if (Math.abs(totalPct - 100) > 0.5) {
      throw new ApiError(400, 'Percentages must sum to 100');
    }
    return customAllocations.map((a) => ({
      familyMember: a.familyMemberId || a.familyMember,
      amount: round2((amount * parseFloat(a.percent)) / 100),
      percent: parseFloat(a.percent),
    }));
  }

  if (splitType === SPLIT_TYPES.CUSTOM) {
    const totalCustom = customAllocations.reduce((s, a) => s + parseFloat(a.amount || 0), 0);
    if (Math.abs(totalCustom - amount) > 0.02) {
      throw new ApiError(400, `Custom amounts must sum to ₹${amount}`);
    }
    return customAllocations.map((a) => ({
      familyMember: a.familyMemberId || a.familyMember,
      amount: round2(parseFloat(a.amount)),
      percent: round2((parseFloat(a.amount) / amount) * 100),
    }));
  }

  throw new ApiError(400, 'Invalid split type');
};

module.exports = { buildAllocations, round2 };
