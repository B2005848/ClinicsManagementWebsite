const express = require("express");
const router = express.Router();
const handleStaffController = require("../Controllers/handle.staff.controller");

//========== ADD A NEW STAFF===============
router.post("/createAccount", handleStaffController.createAccount);

// ==========GET ALL ACCOUNT STAFFS==========
router.get("/getListAccount", handleStaffController.getStaffList);

// ======= GET INFORMATION STAFF BY STAFF_ID=============
router.get("/getInformationDetail/:id", handleStaffController.getStaffInfoById);

// ========SEARCH STAFFS=========================
router.get("/search", handleStaffController.searchStaffs);
module.exports = router;
