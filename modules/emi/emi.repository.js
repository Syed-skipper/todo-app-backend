const { EmiPlan } = require('../../models');

const create = (data) => EmiPlan.create(data);
const findAll = (filter = {}) =>
  EmiPlan.find(filter)
    .populate('card', 'nickname lastFourDigits')
    .populate('member', 'name')
    .sort({ createdAt: -1 });
const findById = (id) =>
  EmiPlan.findById(id).populate('card').populate('member', 'name email');
const updateById = (id, data) =>
  EmiPlan.findByIdAndUpdate(id, data, { new: true }).populate('card member');
const deleteById = (id) => EmiPlan.findByIdAndDelete(id);

module.exports = { create, findAll, findById, updateById, deleteById };
