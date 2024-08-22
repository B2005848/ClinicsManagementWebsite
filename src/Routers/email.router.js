// src/routes/otp.routes.js
const express = require("express");
const { sendOtpController } = require("../Controllers/email.controller");
const router = express.Router();

router.post("/send-otp", sendOtpController);

module.exports = router;
