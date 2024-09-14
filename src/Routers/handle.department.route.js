const express = require("express");
const router = express.Router();
const handleDepartmentController = require("../Controllers/handle.department.controller");

router.get("/getList", handleDepartmentController.getDepartments);

module.exports = router;
