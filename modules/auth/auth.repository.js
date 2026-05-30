const { User } = require('../../models');

const findByEmail = (email) => User.findOne({ email });
const findById = (id) => User.findById(id).select('-password');
const create = (data) => User.create(data);
const updateById = (id, data) =>
  User.findByIdAndUpdate(id, data, { new: true, runValidators: true }).select('-password');
const findAll = (filter = {}) =>
  User.find(filter).select('-password').sort({ createdAt: -1 });

module.exports = { findByEmail, findById, create, updateById, findAll };
