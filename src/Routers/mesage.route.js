const express = require("express");
const messageController = require("../Controllers/message.controller");
const router = express.Router();

// gửi tin nhắn
router.post("/sendMessage", messageController.sendMessage);

// Lấy nội dung tin nhắn
router.get("/getMessages", messageController.getMessages);

// // Lấy các hộp thoại nhắn tin
router.get("/chatPairs", messageController.getChatPairs);

module.exports = router;
