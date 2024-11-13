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

// ===================== GET STAFF SHIFT INFORMATION =====================
router.get("/getStaffShifts/:id", handleStaffController.getInformationShift);

// ==========ADD SPECIALTIES FOR STAFF==========
router.post(
  "/addSpecialtiesForStaff/:id",
  handleStaffController.addSpecialtiesForStaff
);

//============ADD SHIFTS FOF STAFF==============
router.post("/:id/shifts", handleStaffController.addShiftsForStaff);

// ========== CẬP NHẬT THÔNG TIN CÔNG VIỆC NHÂN VIÊN ==========
router.patch(
  "/updateStaffInfoWork/:id",
  handleStaffController.updateStaffInfoWork
);

// ========== CẬP NHẬT THÔNG TIN NHÂN VIÊN ==========
router.patch("/:id", handleStaffController.updateStaffInfo);

//================DELETE STAFF BY ID===============
router.delete("/:id", handleStaffController.deleteStaff);
module.exports = router;
