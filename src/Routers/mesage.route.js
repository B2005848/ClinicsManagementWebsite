const express = require("express");
const messageController = require("../Controllers/message.controller");
const router = express.Router();

router.post("/sendMessage", messageController.sendMessage);
router.get("/getMessages", messageController.getMessages);

module.exports = router;
