const service = require('./memberPayment.service');
const { sendSuccess } = require('../../utils/response');

const create = async (req, res) => {
  const payment = await service.create(req.body, req.user.user_id);
  sendSuccess(res, payment, 'Payment recorded', 201);
};

const list = async (req, res) => {
  const payments = await service.list(req.query);
  sendSuccess(res, payments);
};

const getById = async (req, res) => {
  const payment = await service.getById(req.params.id);
  sendSuccess(res, payment);
};

const remove = async (req, res) => {
  const result = await service.remove(req.params.id);
  sendSuccess(res, result);
};

module.exports = { create, list, getById, remove };
