const express = require("express");
const router = express.Router();

// Import các controller để xử lý logic
const handlePaymentMethodControllers = require("../Controllers/handle.paymentmethod.controller");

// ----------------------------GET LIST PAYMENT METHODS------------------------------
router.get("/", handlePaymentMethodControllers.getListPaymentMethods);

// ----------------------------CREATE NEW PAYMENT METHOD------------------------------
router.post("/", handlePaymentMethodControllers.createPaymentMethod);

// ----------------------------UPDATE PAYMENT METHOD------------------------------
router.put("/:id", handlePaymentMethodControllers.updatePaymentMethod);

// ----------------------------DELETE PAYMENT METHOD------------------------------
router.delete("/:id", handlePaymentMethodControllers.deletePaymentMethod);

module.exports = router;
