const express = require("express");
const router = express.Router();
const handleStaffController = require("../Controllers/handle.staff.controller");
router.post("/createAccount", handleStaffController.createAccount);
router.get("/getListAccount", handleStaffController.getStaffList);

module.exports = router;
