const memberService = require('./member.service');
const { sendSuccess, sendPaginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');

const getAllMembers = async (req, res) => {
  const members = await memberService.getAllMembers();
  sendSuccess(res, members);
};

const getMemberDashboard = async (req, res) => {
  const dashboard = await memberService.getMemberDashboard(
    req.params.id,
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, dashboard);
};

const getMemberExpenseHistory = async (req, res) => {
  const pagination = getPagination(req.query);
  const { expenses, total } = await memberService.getMemberExpenseHistory(
    req.params.id,
    req.query,
    pagination
  );
  sendPaginated(res, expenses, buildPaginationMeta(total, pagination.page, pagination.limit));
};

module.exports = { getAllMembers, getMemberDashboard, getMemberExpenseHistory };
