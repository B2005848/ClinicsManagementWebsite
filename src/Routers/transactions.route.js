const express = require("express");
const router = express.Router();
const transactionController = require("../Controllers/transactions.controller");

// API: GET Filtered Revenue Statistics
router.get("/", transactionController.getFilteredRevenueStatistics);

module.exports = router;
