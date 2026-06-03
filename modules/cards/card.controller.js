const cardService = require('./card.service');
const { sendSuccess } = require('../../utils/response');

const createCard = async (req, res) => {
  const card = await cardService.createCard(req.body, req.user.user_id);
  sendSuccess(res, card, 'Card created', 201);
};

const getAllCards = async (req, res) => {
  const cards = await cardService.getAllCards();
  sendSuccess(res, cards);
};

const getCardById = async (req, res) => {
  const card = await cardService.getCardById(req.params.id);
  sendSuccess(res, card);
};

const updateCard = async (req, res) => {
  const card = await cardService.updateCard(req.params.id, req.body);
  sendSuccess(res, card, 'Card updated');
};

const deleteCard = async (req, res) => {
  const result = await cardService.deleteCard(req.params.id);
  sendSuccess(res, result);
};

const getCardSummary = async (req, res) => {
  const summary = await cardService.getCardSummary(
    req.params.id,
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, summary);
};

const getAllSummaries = async (req, res) => {
  const data = await cardService.getAllCardsWithSummaries(
    parseInt(req.query.month, 10),
    parseInt(req.query.year, 10)
  );
  sendSuccess(res, data);
};

module.exports = {
  createCard,
  getAllCards,
  getCardById,
  updateCard,
  deleteCard,
  getCardSummary,
  getAllSummaries,
};
