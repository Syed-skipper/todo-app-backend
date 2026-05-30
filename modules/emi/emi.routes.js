const express = require('express');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const emiController = require('./emi.controller');
const { createEmiValidator, idParamValidator } = require('./emi.validator');

const router = express.Router();
router.use(authenticateToken);

router.post('/', createEmiValidator, validate, asyncHandler(emiController.createEmi));
router.get('/', asyncHandler(emiController.listEmiPlans));
router.patch('/:id/pay-installment', idParamValidator, validate, asyncHandler(emiController.recordPayment));
router.put('/:id', idParamValidator, validate, asyncHandler(emiController.updateEmi));
router.delete('/:id', idParamValidator, validate, asyncHandler(emiController.deleteEmi));

module.exports = router;
