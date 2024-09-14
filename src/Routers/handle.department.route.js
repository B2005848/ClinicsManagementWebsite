const express = require("express");
const router = express.Router();
const handleDepartmentController = require("../Controllers/handle.department.controller");

//====== GET LIST DEPARTMENT
router.get("/getList", handleDepartmentController.getDepartments);

//========== CREATE A NEW DEPARTMENT
router.post("/create", handleDepartmentController.createDepartment);

module.exports = router;
