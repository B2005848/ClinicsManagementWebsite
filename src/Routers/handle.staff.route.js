const express = require("express");
const router = express.Router();
const handleStaffController = require("../Controllers/handle.staff.controller");

// ==========GET ALL ACCOUNT STAFFS==========
router.get("/getListAccount", handleStaffController.getStaffList);

// ======= GET INFORMATION STAFF BY STAFF_ID=============
router.get("/getInformationDetail/:id", handleStaffController.getStaffInfoById);

// ========== GET DOCTOR BY SPECIALTY_ID================
router.get(
  "/getListDoctorBySpecialtyId/:id",
  handleStaffController.selectDoctorBySpecialtyId
);

// ========SEARCH STAFFS=========================
router.get("/search", handleStaffController.searchStaffs);

// ==========GET DOCTOR SHIFTS BY DEPARTMENT_ID, SPECIALTY_ID, AND DOCTOR_ID==========
router.get(
  "/getDoctorShifts/:department_id/:specialty_id/:doctor_id",
  handleStaffController.getDoctorShifts
);

// ==========ADD SPECIALTIES FOR STAFF==========
router.post(
  "/addSpecialtiesForStaff/:id",
  handleStaffController.addSpecialtiesForStaff
);
module.exports = router;
