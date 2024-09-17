const express = require("express");
const accountPatientControllers = require("../Controllers/account.patients.controller");
const router = express.Router();

// =========CREATE ACCOUNT PATIENT============
router.post("/create", accountPatientControllers.createAccount);
router.post("/login", accountPatientControllers.checkLogin);
router.put("/status/update/:id", accountPatientControllers.updateStatusAccount);
module.exports = router;
