const express = require("express");
const {
  createGroup,
  getGroup,
  updateGroup,
  deleteGroup,
  getGroupAllTask
} = require("../controllers/groupController");
const authenticateToken = require("../authMiddleware");
const router = express.Router();

router.get("/:id", authenticateToken, getGroup);
router.post("/", authenticateToken, createGroup);
router.put("/:id", authenticateToken, updateGroup);
router.delete("/:id", authenticateToken, deleteGroup);
router.get('/all/:id', authenticateToken, getGroupAllTask);

module.exports = router;
