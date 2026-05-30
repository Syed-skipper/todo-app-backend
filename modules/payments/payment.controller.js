const paymentService = require('./payment.service');
const { sendSuccess } = require('../../utils/response');

const createPayment = async (req, res) => {
  const payment = await paymentService.createPayment(req.body, req.user.user_id);
  sendSuccess(res, payment, 'Payment record created', 201);
};

const listPayments = async (req, res) => {
  const payments = await paymentService.listPayments(req.query);
  sendSuccess(res, payments);
};

const markAsPaid = async (req, res) => {
  const payment = await paymentService.markAsPaid(
    req.params.id,
    req.body.paidAmount,
    req.body.paidDate
  );
  sendSuccess(res, payment, 'Payment marked as paid');
};

const getUpcomingDue = async (req, res) => {
  const payments = await paymentService.getUpcomingDue(parseInt(req.query.days, 10) || 7);
  sendSuccess(res, payments);
};

module.exports = { createPayment, listPayments, markAsPaid, getUpcomingDue };
