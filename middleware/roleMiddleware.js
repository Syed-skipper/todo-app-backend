const ApiError = require('../utils/ApiError');
const { ROLES } = require('../constants');

const requireRole = (...roles) => (req, res, next) => {
  if (!req.user?.role || !roles.includes(req.user.role)) {
    return next(new ApiError(403, 'Insufficient permissions'));
  }
  next();
};

const requireAdmin = requireRole(ROLES.ADMIN);

module.exports = { requireRole, requireAdmin };
