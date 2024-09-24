const express = require("express");
const router = express.Router();
const accountStaffController = require("../Controllers/account.staff.controller");

//========== ADD A NEW STAFF===============
router.post("/createAccount", accountStaffController.createAccount);

//=========CHECK ADMIN LOGIN=============
router.post("/adminLogin", accountStaffController.checkAdminLogin);

//==========CHECK EXPIRE OF ACESS TOKEN===========
router.post("/checkExipredAcessToken", accountStaffController.checkAccessToken);

//============= REFRESH ACCESS TOKEN ==============
router.post("/refreshAccessToken", accountStaffController.refreshAccessToken);

//==========CHECK EXPIRE OF REFRESH TOKEN===========
router.post(
  "/checkExipredRefreshToken",
  accountStaffController.checkRefreshToken
);

module.exports = router;
