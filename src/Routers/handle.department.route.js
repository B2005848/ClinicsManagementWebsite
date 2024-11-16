const express = require("express");
const router = express.Router();
const handleDepartmentController = require("../Controllers/handle.department.controller");

//====== GET LIST DEPARTMENT
router.get(
  "/getListForPatient",
  handleDepartmentController.getDepartmentsForPatient
);

router.get(
  "/getListForAdmin",
  handleDepartmentController.getDepartmentsForAdmin
);

//========== CREATE A NEW DEPARTMENT
router.post("/create", handleDepartmentController.createDepartment);

//============ DELETE A DEPARTMENT
router.delete("/delete/:id", handleDepartmentController.deleteDepartment);

//============ MODIFY INFORMATION A DEPARTMENT-
router.patch("/modify/:id", handleDepartmentController.modifyDepartment);

// ========SEARCH DEPARTMENTS=========================
router.get("/search", handleDepartmentController.searchDepartments);

// ========GET DEPARTMENTS BY SPECIALTY=========================
router.get(
  "/specialty/:specialtyId",
  handleDepartmentController.getDepartmentsBySpecialty
);

// ========CHECK IF DEPARTMENT NAME EXISTS
router.post(
  "/check-name",
  handleDepartmentController.checkDepartmentNameExists
);

// ========CHECK IF DEPARTMENT ID EXISTS
router.post("/check-id", handleDepartmentController.checkDepartmentIdExists);

// GET LIST STAFF BY DEP_ID
router.get(
  "/liststaff/:department_id",
  handleDepartmentController.getListStaffByDep
);
module.exports = router;
