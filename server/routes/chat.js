const express = require("express");
const router = express.Router();
const { getConversations, getOrCreateConversation, getMessages, sendMessage } = require("../controllers/chatController");
const { protect } = require("../middleware/auth");

router.get("/", protect, getConversations);
router.post("/", protect, getOrCreateConversation);
router.get("/:conversationId/messages", protect, getMessages);
router.post("/:conversationId/messages", protect, sendMessage);

module.exports = router;
