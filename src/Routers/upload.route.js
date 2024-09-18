// src/routes/otp.routes.js
const express = require("express");
const { uploadAvatarController } = require("../Controllers/upload.controller");
const router = express.Router();

router.post("/uploadAvtStaff", uploadAvatarController);

module.exports = router;
