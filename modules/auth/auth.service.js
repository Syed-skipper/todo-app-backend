const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const ApiError = require('../../utils/ApiError');
const { ROLES } = require('../../constants');
const { getJwtSecret } = require('../../config/jwt');
const authRepository = require('./auth.repository');
const { ActivityLog } = require('../../models');

const signToken = (user) =>
  jwt.sign(
    { user_id: user._id, email: user.email, role: user.role, name: user.name },
    getJwtSecret(),
    { expiresIn: process.env.JWT_EXPIRES_IN || '10d' }
  );

const register = async (data, requesterRole) => {
  const existing = await authRepository.findByEmail(data.email);
  if (existing) throw new ApiError(400, 'User already exists');

  const userCount = await require('../../models').User.countDocuments();
  let role = ROLES.FAMILY_MEMBER;
  if (userCount === 0) role = ROLES.ADMIN;
  else if (requesterRole === ROLES.ADMIN && data.role) role = data.role;
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash(data.password, salt);

  const user = await authRepository.create({
    name: data.name,
    email: data.email,
    password: hashedPassword,
    role,
    phone: data.phone,
  });

  const safeUser = await authRepository.findById(user._id);
  return {
    token: signToken(user),
    user: safeUser,
    user_id: safeUser._id,
    user_name: safeUser.name,
    role: safeUser.role,
    email: safeUser.email,
  };
};

const login = async (email, password) => {
  const user = await authRepository.findByEmail(email);
  if (!user || !user.isActive) throw new ApiError(401, 'Invalid credentials');

  const valid = await bcrypt.compare(password, user.password);
  if (!valid) throw new ApiError(401, 'Invalid credentials');

  await ActivityLog.create({
    user: user._id,
    action: 'LOGIN',
    entityType: 'User',
    entityId: user._id,
  });

  const safeUser = await authRepository.findById(user._id);
  return {
    token: signToken(user),
    user: safeUser,
    user_id: safeUser._id,
    user_name: safeUser.name,
    role: safeUser.role,
    email: safeUser.email,
  };
};

const getProfile = (userId) => authRepository.findById(userId);

const updateProfile = async (userId, data) => {
  const updated = await authRepository.updateById(userId, data);
  if (!updated) throw new ApiError(404, 'User not found');
  return updated;
};

const changePassword = async (userId, currentPassword, newPassword) => {
  const fullUser = await require('../../models').User.findById(userId);
  if (!fullUser) throw new ApiError(404, 'User not found');
  const valid = await bcrypt.compare(currentPassword, fullUser.password);
  if (!valid) throw new ApiError(400, 'Current password is incorrect');

  const salt = await bcrypt.genSalt(10);
  fullUser.password = await bcrypt.hash(newPassword, salt);
  await fullUser.save();
  return { message: 'Password updated successfully' };
};

const getActivityLogs = async (userId, { page, limit, skip }) => {
  const filter = userId ? { user: userId } : {};
  const [logs, total] = await Promise.all([
    ActivityLog.find(filter)
      .populate('user', 'name email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    ActivityLog.countDocuments(filter),
  ]);
  return { logs, total };
};

module.exports = {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  getActivityLogs,
  signToken,
};
