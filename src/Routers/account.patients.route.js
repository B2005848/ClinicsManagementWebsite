const express = require("express");
const accountPatientControllers = require("../Controllers/account.patients.controller");
const router = express.Router();

// =========CREATE ACCOUNT PATIENT============
router.post("/create", accountPatientControllers.createAccount);
router.post("/login", accountPatientControllers.checkLogin);

//==========CHECK EXPIRE OF ACESS TOKEN===========
router.post(
  "/checkExipredAcessToken",
  accountPatientControllers.checkAccessToken
);

//============= REFRESH ACCESS TOKEN ==============
router.post(
  "/refreshAccessToken",
  accountPatientControllers.refreshAccessToken
);

//==========CHECK EXPIRE OF REFRESH TOKEN===========
router.post(
  "/checkExipredRefreshToken",
  accountPatientControllers.checkRefreshToken
);

router.put("/status/update/:id", accountPatientControllers.updateStatusAccount);
module.exports = router;
