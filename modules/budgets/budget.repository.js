const { Budget } = require('../../models');

const create = (data) => Budget.create(data);
const findAll = (filter) => Budget.find(filter).populate('member card').sort({ year: -1, month: -1 });
const findById = (id) => Budget.findById(id).populate('member card');
const updateById = (id, data) => Budget.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => Budget.findByIdAndDelete(id);
const findOne = (filter) => Budget.findOne(filter);

module.exports = { create, findAll, findById, updateById, deleteById, findOne };
