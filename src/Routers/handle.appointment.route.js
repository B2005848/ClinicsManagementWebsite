const express = require("express");
const router = express.Router();
const handleAppointmentController = require("../Controllers/handle.appointment.controller");

router.post(
  "/booking/:patient_id",
  handleAppointmentController.AppointmentBooking
);

// Đặt lịch và thanh toán tại phòng khám
// API: POST thêm giao dịch thanh toán tại phòng khám
router.post("/add", handleAppointmentController.addInClinicTransaction);

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

// Endpoint to delete a appointment by id
router.delete("/delete/:id", handleAppointmentController.deleteAppointment);

module.exports = router;
