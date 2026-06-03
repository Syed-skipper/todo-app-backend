const ApiError = require('../../utils/ApiError');
const repo = require('./familyMember.repository');

const create = (data, userId) =>
  repo.create({
    name: data.name,
    relationship: data.relationship,
    phone: data.phone,
    notes: data.notes,
    createdBy: userId,
  });

const list = () => repo.findAll();
const getById = async (id) => {
  const m = await repo.findById(id);
  if (!m) throw new ApiError(404, 'Family member not found');
  return m;
};

const update = async (id, data) => {
  const m = await repo.updateById(id, data);
  if (!m) throw new ApiError(404, 'Family member not found');
  return m;
};

const remove = async (id) => {
  const m = await repo.updateById(id, { isActive: false });
  if (!m) throw new ApiError(404, 'Family member not found');
  return { message: 'Family member deactivated' };
};

module.exports = { create, list, getById, update, remove };
