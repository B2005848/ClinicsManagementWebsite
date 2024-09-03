// src/routes/otp.routes.js
const express = require("express");
const { emailControllers } = require("../Controllers/email.controller");
const router = express.Router();

router.post("/send-otp", emailControllers.sendOtpPatientController);
router.post("/verify-otp", emailControllers.checkOtpPatientController);

module.exports = router;
