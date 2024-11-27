const express = require("express");
const router = express.Router();
const transactionController = require("../Controllers/transactions.controller");

// API: GET Filtered Revenue Statistics
router.post("/", transactionController.getFilteredRevenueStatistics);

// Lấy lịch sử thanh toán của bệnh nhân
router.get(
  "/payment-history-appointment/:patientId",
  transactionController.getPaymentHistoryByAppointment
);
module.exports = router;
