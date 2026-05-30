const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const asyncHandler = require('../../utils/asyncHandler');
const validate = require('../../middleware/validate');
const authenticateToken = require('../../middleware/authMiddleware');
const expenseController = require('./expense.controller');
const {
  createExpenseValidator,
  updateExpenseValidator,
  listExpenseValidator,
  idParamValidator,
} = require('./expense.validator');

const uploadDir = path.join(__dirname, '../../uploads/receipts');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: uploadDir,
  filename: (req, file, cb) => {
    const unique = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    cb(null, `${unique}${path.extname(file.originalname)}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowed = /jpeg|jpg|png|pdf|webp/;
    if (allowed.test(path.extname(file.originalname).toLowerCase())) cb(null, true);
    else cb(new Error('Only images and PDF allowed'));
  },
});

const router = express.Router();
router.use(authenticateToken);

router.post(
  '/',
  upload.single('receipt'),
  (req, res, next) => {
    if (req.file) req.body.receiptUrl = `/uploads/receipts/${req.file.filename}`;
    next();
  },
  createExpenseValidator,
  validate,
  asyncHandler(expenseController.createExpense)
);
router.get('/', listExpenseValidator, validate, asyncHandler(expenseController.listExpenses));
router.get('/:id', idParamValidator, validate, asyncHandler(expenseController.getExpenseById));
router.put('/:id', updateExpenseValidator, validate, asyncHandler(expenseController.updateExpense));
router.delete('/:id', idParamValidator, validate, asyncHandler(expenseController.deleteExpense));

module.exports = router;
