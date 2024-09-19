const express = require("express");
const router = express.Router();
const handleDepartmentController = require("../Controllers/handle.department.controller");

//====== GET LIST DEPARTMENT
router.get("/getList", handleDepartmentController.getDepartments);

//========== CREATE A NEW DEPARTMENT
router.post("/create", handleDepartmentController.createDepartment);

//============ DELETE A DEPARTMENT
router.delete("/delete/:id", handleDepartmentController.deleteDepartment);

//============ MODIFY INFORMATION A DEPARTMENT-
router.patch("/modify/:id", handleDepartmentController.modifyDepartment);

// ========SEARCH DEPARTMENTS=========================
router.get("/search", handleDepartmentController.searchDepartments);
module.exports = router;
