const express = require("express");
const router = express.Router();
const accountStaffController = require("../Controllers/account.staff.controller");

//========== ADD A NEW STAFF===============
router.post("/createAccount", accountStaffController.createAccount);

//=========CHECK ADMIN LOGIN=============
router.post("/adminLogin", accountStaffController.checkAdminLogin);

module.exports = router;