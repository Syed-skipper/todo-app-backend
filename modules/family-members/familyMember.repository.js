const { FamilyMember } = require('../../models');

const create = (data) => FamilyMember.create(data);
const findAll = (filter = { isActive: true }) => FamilyMember.find(filter).sort({ name: 1 });
const findById = (id) => FamilyMember.findById(id);
const updateById = (id, data) => FamilyMember.findByIdAndUpdate(id, data, { new: true, runValidators: true });
const deleteById = (id) => FamilyMember.findByIdAndDelete(id);

module.exports = { create, findAll, findById, updateById, deleteById };
