const express = require("express");
const accountPatientControllers = require("../Controllers/account.patients.controller");
const router = express.Router();

router.post("/create", accountPatientControllers.createAccount);
router.post("/login", accountPatientControllers.checkLogin);
router.post(
  "/status/update/:id",
  accountPatientControllers.updateStatusAccount
);
module.exports = router;
