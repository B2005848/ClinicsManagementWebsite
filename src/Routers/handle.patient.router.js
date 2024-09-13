const express = require("express");
const router = express.Router();
const handlePatientController = require("../Controllers/handle.patient.controller");

router.get("/getinfo/:username", handlePatientController.getPatientByUsername);

router.get(
  "/getlistaccountpatients",
  handlePatientController.getListAccountPatients
);

router.post(
  "/information/update/:id",
  handlePatientController.updateInformation
);
module.exports = router;
