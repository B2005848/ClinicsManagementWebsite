const express = require("express");
const accountPatientControllers = require("../Controllers/account.patients.controller");
const router = express.Router();

router.post("/create", accountPatientControllers.createAccount);
router.post("/login", accountPatientControllers.checkLogin);
module.exports = router;
