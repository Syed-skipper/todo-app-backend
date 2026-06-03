const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const authenticateToken = require('../../middleware/authMiddleware');
const controller = require('./familyMember.controller');

const router = express.Router();
router.use(authenticateToken);

router.post('/', asyncHandler(controller.create));
router.get('/', asyncHandler(controller.list));
router.get('/:id', asyncHandler(controller.getById));
router.put('/:id', asyncHandler(controller.update));
router.delete('/:id', asyncHandler(controller.remove));

module.exports = router;
