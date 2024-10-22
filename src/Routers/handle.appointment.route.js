const express = require("express");
const router = express.Router();
const handleAppointmentController = require("../Controllers/handle.appointment.controller");

router.post(
  "/booking/:patient_id",
  handleAppointmentController.AppointmentBooking
);

router.put("/modifyStatus/:id", handleAppointmentController.ModifyStatus);

module.exports = router;
