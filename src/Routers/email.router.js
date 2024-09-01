// src/routes/otp.routes.js
const express = require("express");
const { emailControllers } = require("../Controllers/email.controller");
const router = express.Router();

router.post("/send-otp", emailControllers.sendOtpController);

module.exports = router;
