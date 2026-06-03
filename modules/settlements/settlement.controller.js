const service = require('./settlement.service');
const { sendSuccess } = require('../../utils/response');
const { getCurrentMonthYear } = require('../../utils/dateHelpers');

const parsePeriod = (query) => {
  const { month: m, year: y } = getCurrentMonthYear();
  return {
    month: parseInt(query.month, 10) || m,
    year: parseInt(query.year, 10) || y,
  };
};

const getBalances = async (req, res) => {
  const { month, year } = parsePeriod(req.query);
  const data = await service.getOutstandingBalances(month, year);
  sendSuccess(res, data);
};

const getStatement = async (req, res) => {
  const { month, year } = parsePeriod(req.query);
  const data = await service.getMonthlyStatement(month, year, req.query.cardId);
  sendSuccess(res, data);
};

const getMemberReport = async (req, res) => {
  const { month, year } = parsePeriod(req.query);
  const data = await service.getMemberSettlementReport(req.params.memberId, month, year);
  sendSuccess(res, data);
};

const getWhatsApp = async (req, res) => {
  const { month, year } = parsePeriod(req.query);
  const data = await service.generateWhatsAppMessage(req.params.memberId, month, year);
  sendSuccess(res, data);
};

module.exports = { getBalances, getStatement, getMemberReport, getWhatsApp };
