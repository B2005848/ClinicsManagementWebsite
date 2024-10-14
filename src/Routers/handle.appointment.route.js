const express = require("express");
const router = express.Router();
const handleAppointmentController = require("../Controllers/handle.appointment.controller");

router.post(
  "/booking/:patient_id",
  handleAppointmentController.AppointmentBooking
);
module.exports = router;
