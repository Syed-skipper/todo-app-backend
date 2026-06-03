const service = require('./familyMember.service');
const { sendSuccess } = require('../../utils/response');

const create = async (req, res) => {
  const member = await service.create(req.body, req.user.user_id);
  sendSuccess(res, member, 'Family member created', 201);
};

const list = async (req, res) => {
  const members = await service.list();
  sendSuccess(res, members);
};

const getById = async (req, res) => {
  const member = await service.getById(req.params.id);
  sendSuccess(res, member);
};

const update = async (req, res) => {
  const member = await service.update(req.params.id, req.body);
  sendSuccess(res, member, 'Updated');
};

const remove = async (req, res) => {
  const result = await service.remove(req.params.id);
  sendSuccess(res, result);
};

module.exports = { create, list, getById, update, remove };
