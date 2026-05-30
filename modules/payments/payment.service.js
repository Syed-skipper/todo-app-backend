const ApiError = require('../../utils/ApiError');
const { Notification } = require('../../models');
const { PAYMENT_STATUS, NOTIFICATION_TYPES } = require('../../constants');
const paymentRepository = require('./payment.repository');

const createPayment = async (data, userId) => {
  return paymentRepository.create({
    card: data.cardId,
    billingMonth: data.billingMonth,
    billingYear: data.billingYear,
    statementGenerated: data.statementGenerated ?? false,
    amountDue: data.amountDue,
    minimumDue: data.minimumDue,
    status: data.status || PAYMENT_STATUS.PENDING,
    dueDate: data.dueDate,
    notes: data.notes,
    createdBy: userId,
  });
};

const listPayments = (query) => {
  const filter = {};
  if (query.cardId) filter.card = query.cardId;
  if (query.status) filter.status = query.status;
  if (query.month) filter.billingMonth = parseInt(query.month, 10);
  if (query.year) filter.billingYear = parseInt(query.year, 10);
  return paymentRepository.findAll(filter);
};

const markAsPaid = async (id, paidAmount, paidDate) => {
  const payment = await paymentRepository.updateById(id, {
    status: PAYMENT_STATUS.PAID,
    paidAmount,
    paidDate: paidDate || new Date(),
  });
  if (!payment) throw new ApiError(404, 'Payment not found');
  return payment;
};

const checkOverduePayments = async () => {
  const now = new Date();
  const overdue = await paymentRepository.findAll({
    status: PAYMENT_STATUS.PENDING,
    dueDate: { $lt: now },
  });
  for (const payment of overdue) {
    await paymentRepository.updateById(payment._id, { status: PAYMENT_STATUS.OVERDUE });
    await Notification.create({
      user: payment.createdBy,
      type: NOTIFICATION_TYPES.DUE_DATE,
      title: 'Payment overdue',
      message: `Bill for ${payment.card?.nickname} is overdue`,
      metadata: { paymentId: payment._id },
    });
  }
  return overdue.length;
};

const getUpcomingDue = async (days = 7) => {
  const end = new Date();
  end.setDate(end.getDate() + days);
  return paymentRepository.findAll({
    status: { $in: [PAYMENT_STATUS.PENDING, PAYMENT_STATUS.OVERDUE] },
    dueDate: { $lte: end },
  });
};

module.exports = {
  createPayment,
  listPayments,
  markAsPaid,
  checkOverduePayments,
  getUpcomingDue,
};
