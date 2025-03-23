const express = require("express");
const { createTodo, getTodo, updateTodo, deleteTodo} = require("../controllers/todoController");
const authenticateToken = require("../authMiddleware");
const router = express.Router();

router.get('/:id',authenticateToken, getTodo);
router.post("/", authenticateToken, createTodo);
router.put('/:id', authenticateToken, updateTodo);
router.delete('/:id', authenticateToken, deleteTodo);

module.exports = router;
