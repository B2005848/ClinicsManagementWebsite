const ApiError = require("../api-error");
const handleAppointmentService = require("../Services/handle.appointment.service");

const handleAppointmentController = {
  //BOOKING
  async AppointmentBooking(req, res, next) {
    try {
      const bookingData = {
        patient_id: req.params.patient_id,
        staff_id: req.body.staff_id,
        department_id: req.body.department_id,
        appointment_date: req.body.appointment_date,
        start_time: req.body.start_time,
        end_time: req.body.end_time,
        shift_id: req.body.shift_id,
        service_id: req.body.service_id,
        reason: req.body.reason,
      };

      const result = await handleAppointmentService.AppointmentBooking(
        bookingData
      );
      if (result.status === true) {
        res.json({
          message: result.message,
          data: result.data,
        });
      } else {
        res.json({
          message: result.message,
        });
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = handleAppointmentController;
