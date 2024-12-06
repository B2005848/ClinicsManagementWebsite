const express = require("express");
const paymentController = require("../Controllers/handle.transaction.vnpay.controller");
const router = express.Router();

// Định nghĩa các route cho các phương thức
// APP
router.post(
  "/appointment-payment",
  paymentController.createVNPayPaymentForAppointment
);

// WEB
router.post(
  "/appointment-payment-web",
  paymentController.createVNPayPaymentForWeb
);

router.post(
  "/prescription-payment",
  paymentController.createVNPayPaymentForPrescription
);
router.get("/vnpay-return", paymentController.handleVNPayReturnUrl);

router.get("/vnpay-return-web", paymentController.handleVNPayReturnUrlWeb);

router.post("/cancel-transaction", paymentController.cancelTransaction);

module.exports = router;
