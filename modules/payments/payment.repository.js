const { Payment } = require('../../models');

const create = (data) => Payment.create(data);
const findAll = (filter) =>
  Payment.find(filter).populate('card', 'nickname bankName lastFourDigits dueDate').sort({ dueDate: 1 });
const findById = (id) => Payment.findById(id).populate('card');
const updateById = (id, data) => Payment.findByIdAndUpdate(id, data, { new: true }).populate('card');
const deleteById = (id) => Payment.findByIdAndDelete(id);

module.exports = { create, findAll, findById, updateById, deleteById };
