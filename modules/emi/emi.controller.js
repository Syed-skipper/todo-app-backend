const emiService = require('./emi.service');
const { sendSuccess } = require('../../utils/response');

const createEmi = async (req, res) => {
  const plan = await emiService.createEmi(req.body, req.user.user_id);
  sendSuccess(res, plan, 'EMI plan created', 201);
};

const listEmiPlans = async (req, res) => {
  const plans = await emiService.listEmiPlans(req.query.active !== 'false');
  sendSuccess(res, plans);
};

const recordPayment = async (req, res) => {
  const plan = await emiService.recordInstallmentPayment(req.params.id);
  sendSuccess(res, plan, 'Installment recorded');
};

const updateEmi = async (req, res) => {
  const plan = await emiService.updateEmi(req.params.id, req.body);
  sendSuccess(res, plan);
};

const deleteEmi = async (req, res) => {
  const result = await emiService.deleteEmi(req.params.id);
  sendSuccess(res, result);
};

module.exports = { createEmi, listEmiPlans, recordPayment, updateEmi, deleteEmi };
