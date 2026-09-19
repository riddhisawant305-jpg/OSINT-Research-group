const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const {
  getConversations,
  getMessagesWithUser,
  sendMessage,
  markConversationAsRead,
} = require("../controllers/messageController");

router.use(protect);

router.get("/conversations", getConversations);
router.get("/:userId", getMessagesWithUser);
router.post("/:userId", sendMessage);
router.put("/read/:userId", markConversationAsRead);

module.exports = router;
