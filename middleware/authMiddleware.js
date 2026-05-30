const jwt = require('jsonwebtoken');
const ApiError = require('../utils/ApiError');
const { getJwtSecret } = require('../config/jwt');

const authenticateToken = (req, res, next) => {
  const token = req.header('access-token') || req.header('Authorization')?.replace('Bearer ', '');
  if (!token) {
    return next(new ApiError(401, 'Access denied. No token provided.'));
  }

  try {
    const verified = jwt.verify(token, getJwtSecret());
    req.user = verified;
    next();
  } catch {
    next(new ApiError(401, 'Invalid or expired token'));
  }
};

module.exports = authenticateToken;
