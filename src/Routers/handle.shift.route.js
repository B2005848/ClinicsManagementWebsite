const express = require("express");
const router = express.Router();
const handleShiftController = require("../Controllers/handle.shift.controller");

//==================== GET ALL SHIFT OF CLINIC-=================
router.get("/getList", handleShiftController.getShiftList);

module.exports = router;
