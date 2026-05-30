const analyticsService = require('./analytics.service');
const { sendSuccess } = require('../../utils/response');

const getMonthlyDashboard = async (req, res) => {
  const data = await analyticsService.getMonthlyDashboard(
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, data);
};

const getSmartInsights = async (req, res) => {
  const data = await analyticsService.getSmartInsights();
  sendSuccess(res, data);
};

module.exports = { getMonthlyDashboard, getSmartInsights };
