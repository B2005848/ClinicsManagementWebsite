const express = require("express");
const router = express.Router();
const handlePatientController = require("../Controllers/handle.patient.controller");

router.get(
  "/getinfo/:username",
  handlePatientController.getDATA_patientBy_username
);

module.exports = router;
