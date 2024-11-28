const express = require("express");
const router = express.Router();
const handlePatientController = require("../Controllers/handle.patient.controller");

//============= GET INFORMATION DETAIL PATIENT BY PATIENT_ID
router.get("/getinfo/:username", handlePatientController.getPatientByUsername);

//============ GET ALL ACCOUNT OF PATIENT
router.get(
  "/getlistaccountpatients",
  handlePatientController.getListAccountPatients
);

//============= EDIT INFORMATION DETAIL OF PATIENT BY PATIENT_ID
router.patch(
  "/information/update/:id",
  handlePatientController.updateInformation
);

//================ SEARCH PATIENT====================
router.get("/search", handlePatientController.searchPatients);

// API: Tạo hồ sơ bệnh nhân theo lịch hẹn dành cho chức năng của bác sĩ
router.post("/create", handlePatientController.createPatientRecord);
module.exports = router;
