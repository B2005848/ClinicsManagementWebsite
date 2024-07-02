const express = require("express");
const accountController = require("../Controllers/account.patients.controller");
const router = express.Router();

router.post("/create", accountController.createAccount);
router.post("/login", accountController.checkLogin);
module.exports = router;
