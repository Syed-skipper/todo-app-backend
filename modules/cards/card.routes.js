const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const { requireAdmin } = require('../../middleware/roleMiddleware');
const cardController = require('./card.controller');
const { createCardValidator, updateCardValidator, idParamValidator } = require('./card.validator');

const router = express.Router();

router.use(authenticateToken);

router.post('/', createCardValidator, validate, asyncHandler(cardController.createCard));
router.get('/', asyncHandler(cardController.getAllCards));
router.get('/summaries/all', asyncHandler(cardController.getAllSummaries));
router.get('/:id/summary', idParamValidator, validate, asyncHandler(cardController.getCardSummary));
router.get('/:id', idParamValidator, validate, asyncHandler(cardController.getCardById));
router.put('/:id', requireAdmin, updateCardValidator, validate, asyncHandler(cardController.updateCard));
router.delete('/:id', requireAdmin, idParamValidator, validate, asyncHandler(cardController.deleteCard));

module.exports = router;
