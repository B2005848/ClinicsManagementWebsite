// src/routes/otp.routes.js
const express = require("express");
const {
  uploadAvatarController,
  uploadAvatarPatientController,
} = require("../Controllers/upload.controller");
const router = express.Router();

router.post("/uploadAvtStaff", uploadAvatarController);

router.post("/uploadAvtPatient", uploadAvatarPatientController);

module.exports = router;
