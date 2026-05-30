const ApiError = require('../../utils/ApiError');
const emiRepository = require('./emi.repository');

const createEmi = async (data, userId) => {
  return emiRepository.create({
    title: data.title,
    purchaseAmount: data.purchaseAmount,
    tenure: data.tenure,
    monthlyInstallment: data.monthlyInstallment,
    remainingInstallments: data.remainingInstallments ?? data.tenure,
    card: data.cardId,
    member: data.memberId,
    startDate: data.startDate,
    merchant: data.merchant,
    createdBy: userId,
  });
};

const listEmiPlans = (activeOnly = true) => {
  const filter = activeOnly ? { isActive: true } : {};
  return emiRepository.findAll(filter);
};

const recordInstallmentPayment = async (id) => {
  const plan = await emiRepository.findById(id);
  if (!plan) throw new ApiError(404, 'EMI plan not found');
  if (plan.remainingInstallments <= 0) {
    plan.isActive = false;
    await plan.save();
    throw new ApiError(400, 'All installments completed');
  }
  plan.remainingInstallments -= 1;
  if (plan.remainingInstallments === 0) plan.isActive = false;
  await plan.save();
  return plan;
};

const updateEmi = async (id, data) => {
  const plan = await emiRepository.updateById(id, data);
  if (!plan) throw new ApiError(404, 'EMI plan not found');
  return plan;
};

const deleteEmi = async (id) => {
  const plan = await emiRepository.deleteById(id);
  if (!plan) throw new ApiError(404, 'EMI plan not found');
  return { message: 'EMI plan deleted' };
};

module.exports = { createEmi, listEmiPlans, recordInstallmentPayment, updateEmi, deleteEmi };
