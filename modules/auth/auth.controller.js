const authService = require('./auth.service');
const { sendSuccess, sendPaginated } = require('../../utils/response');
const { getPagination, buildPaginationMeta } = require('../../utils/pagination');
const { ROLES } = require('../../constants');

const register = async (req, res) => {
  const result = await authService.register(req.body, req.user?.role);
  sendSuccess(res, result, 'User registered successfully', 201);
};

const login = async (req, res) => {
  const result = await authService.login(req.body.email, req.body.password);
  sendSuccess(res, result, 'Login successful');
};

const getProfile = async (req, res) => {
  const user = await authService.getProfile(req.user.user_id);
  sendSuccess(res, user);
};

const updateProfile = async (req, res) => {
  const user = await authService.updateProfile(req.user.user_id, req.body);
  sendSuccess(res, user, 'Profile updated');
};

const changePassword = async (req, res) => {
  const result = await authService.changePassword(
    req.user.user_id,
    req.body.currentPassword,
    req.body.newPassword
  );
  sendSuccess(res, result);
};

const getActivityLogs = async (req, res) => {
  const { page, limit, skip } = getPagination(req.query);
  const userId = req.user.role === ROLES.ADMIN ? req.query.userId : req.user.user_id;
  const { logs, total } = await authService.getActivityLogs(userId, { page, limit, skip });
  sendPaginated(res, logs, buildPaginationMeta(total, page, limit));
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getActivityLogs,
};
