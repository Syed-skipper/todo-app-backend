const reportService = require('./report.service');
const { sendSuccess } = require('../../utils/response');

const exportMonthlyPdf = async (req, res) => {
  const buffer = await reportService.generateMonthlyPdf(
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  res.setHeader('Content-Type', 'application/pdf');
  res.setHeader('Content-Disposition', 'attachment; filename=monthly-report.pdf');
  res.send(buffer);
};

const exportCsv = async (req, res) => {
  const csv = await reportService.exportCsv(
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10),
    req.query
  );
  res.setHeader('Content-Type', 'text/csv');
  res.setHeader('Content-Disposition', 'attachment; filename=expenses.csv');
  res.send(csv);
};

const getMemberReport = async (req, res) => {
  const report = await reportService.getMemberSpendingReport(
    req.params.memberId,
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, report);
};

const getCardStatement = async (req, res) => {
  const report = await reportService.getCardStatementSummary(
    req.params.cardId,
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, report);
};

module.exports = { exportMonthlyPdf, exportCsv, getMemberReport, getCardStatement };
