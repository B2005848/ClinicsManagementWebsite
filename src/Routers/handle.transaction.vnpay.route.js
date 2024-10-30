const express = require("express");
const paymentController = require("../controllers/handle.transaction.vnpay.controller");
const router = express.Router();

// Định nghĩa các route cho các phương thức
router.post(
  "/appointment-payment",
  paymentController.createVNPayPaymentForAppointment
);
router.post(
  "/prescription-payment",
  paymentController.createVNPayPaymentForPrescription
);
router.get("/vnpay-return", paymentController.handleVNPayReturnUrl);
router.post("/cancel-transaction", paymentController.cancelTransaction);

module.exports = router;
