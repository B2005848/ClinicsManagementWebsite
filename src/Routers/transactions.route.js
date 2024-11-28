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

// Lấy tổng doanh thu của bệnh nhân theo năm
router.get(
  "/total-revenue/:patientId",
  transactionController.getTotalRevenueByYear
);

// API: Cập nhật trạng thái giao dịch
router.put(
  "/update-status/:transactionId",
  transactionController.updateTransactionStatus
);
module.exports = router;
