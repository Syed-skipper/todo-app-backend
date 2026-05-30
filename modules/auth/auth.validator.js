const { body } = require('express-validator');
const { ROLES } = require('../../constants');

const registerValidator = [
  body('email').isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('name').trim().notEmpty().withMessage('Name is required'),
  body('role').optional().isIn(Object.values(ROLES)),
  body('phone').optional().isMobilePhone('any'),
];

const loginValidator = [
  body('email').isEmail().normalizeEmail(),
  body('password').notEmpty(),
];

const updateProfileValidator = [
  body('name').optional().trim().notEmpty(),
  body('phone').optional().isMobilePhone('any'),
  body('avatar').optional().isURL(),
];

const changePasswordValidator = [
  body('currentPassword').notEmpty(),
  body('newPassword').isLength({ min: 6 }),
];

module.exports = {
  registerValidator,
  loginValidator,
  updateProfileValidator,
  changePasswordValidator,
};
