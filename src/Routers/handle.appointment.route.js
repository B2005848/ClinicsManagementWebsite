const express = require("express");
const router = express.Router();
const handleAppointmentController = require("../Controllers/handle.appointment.controller");

router.post(
  "/booking/:patient_id",
  handleAppointmentController.AppointmentBooking
);

// Chỉnh sửa trạng thái đặt lịch
router.put("/modifyStatus/:id", handleAppointmentController.ModifyStatus);

// Endpoint lấy danh sách lịch hẹn có phân trang
router.get("/getlist", handleAppointmentController.getAppointmentList);

// Endpoint để kiểm tra thời gian đặt lịch đã tồn tại
router.get(
  "/check-existing-time",
  handleAppointmentController.TimeBookingExisting
);

// Endpoint to retrieve appointments by patient_id
router.get(
  "/getinformation/:patient_id",
  handleAppointmentController.getAppointmentsByPatientId
);
module.exports = router;
