const { param, query } = require('express-validator');

const memberIdValidator = [param('id').isMongoId()];
const dashboardQueryValidator = [
  query('month').optional().isInt({ min: 1, max: 12 }),
  query('year').optional().isInt({ min: 2020 }),
];

module.exports = { memberIdValidator, dashboardQueryValidator };
