const express = require("express");
const router = express.Router();
const handlePatientController = require("../Controllers/handle.patient.controller");

router.get("/getinfo/:username", handlePatientController.getPatientByUsername);
router.post("/addanewpatient", handlePatientController.addNew_patient);

router.get("/getlistaccountpatients", handlePatientController.getALL_patients);
module.exports = router;
