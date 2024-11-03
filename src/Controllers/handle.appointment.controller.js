const ApiError = require("../api-error");
const handleAppointmentService = require("../Services/handle.appointment.service");

const handleAppointmentController = {
  // Lấy danh sách lịch hẹn với phân trang
  async getAppointmentList(req, res, next) {
    try {
      // Lấy trang từ query, mặc định là trang 1 nếu không có giá trị
      const page = parseInt(req.query.page) || 1;

      // Gọi hàm getAppointmentList trong service
      const result = await handleAppointmentService.getAppointmentList(page);

      // Kiểm tra kết quả và gửi phản hồi
      if (result.status === true) {
        res.status(200).json({
          message: result.message,
          totalPages: result.totalPages,
          appointmentList: result.appointmentList,
          itemsPerPage: result.itemsPerPage,
        });
      } else {
        res.status(204).json({
          message: result.message,
          totalPages: result.totalPages,
          appointmentList: result.appointmentList,
        });
      }
    } catch (error) {
      return next(new ApiError(500, "Lỗi máy chủ nội bộ"));
    }
  },

  // Lấy thông tin lịch hen theo patient_id
  async getAppointmentsByPatientId(req, res, next) {
    try {
      const patient_id = req.params.patient_id; // Get patient_id from route parameters

      const result = await handleAppointmentService.getAppointmentsByPatientId(
        patient_id
      );

      if (result.status === true) {
        res.json({
          status: result.status,
          message: result.message,
          data: result.data,
        });
      } else {
        res.json({
          status: result.status,
          message: result.message,
        });
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

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

  //Modify status appointment
  async ModifyStatus(req, res, next) {
    try {
      const appointment_id = req.params.id;
      const status = req.body.status;

      const result = await handleAppointmentService.ModifyStatus(
        appointment_id,
        status
      );
      if (result.success === true) {
        res.json({ message: result.message, status: result.success });
      } else {
        res.json({ message: result.message, status: result.success });
      }
    } catch (error) {
      return next(new ApiError(500, error.message));
    }
  },

  // Lọc giờ được chọn bởi id doctor, id_department, id_service, appointment_date, start_time, shift_id buổi sáng hoặc chiều (Lọc lịch hẹn trùng để nguồi dùng không booking được)
  async TimeBookingExisting(req, res, next) {
    try {
      const filterData = {
        doctor_id: req.query.doctor_id,
        department_id: req.query.department_id,
        service_id: req.query.service_id,
        appointment_date: req.query.appointment_date,
        start_time: req.query.start_time,
        shift_id: req.query.shift_id,
      };
      console.log("Filter Data:", filterData);

      const result = await handleAppointmentService.TimeBookingExisting(
        filterData
      );

      if (result.status === true) {
        res.json({
          status: result.status,
          message: result.message,
        });
      } else {
        res.json({
          status: result.status,
          message: result.message,
        });
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = handleAppointmentController;
