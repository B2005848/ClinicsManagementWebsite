const { knex } = require("../../db.config");
require("dotenv").config();

const handleBookingService = {
  async AppointmentBooking(bookingData) {
    try {
      // Check appointment exits by start_time, end_time, doctor_id
      const existingAppointment = await knex("APPOINTMENTS")
        .where("staff_id", bookingData.staff_id)
        .andWhere("appointment_date", bookingData.appointment_date)
        .andWhere(function () {
          this.whereBetween("start_time", [
            bookingData.start_time,
            bookingData.end_time,
          ]).orWhereBetween("end_time", [
            bookingData.start_time,
            bookingData.end_time,
          ]);
        })
        .first();

      if (existingAppointment) {
        return {
          status: false,
          message:
            "Booking failed: Appointment time conflicts with an existing appointment.",
        };
      }

      // If dont exits
      const resultBooking = await knex("APPOINTMENTS").insert(bookingData);

      if (resultBooking) {
        console.log(
          `Booking ID: ${resultBooking[0]} has been successfully booked`,
          [resultBooking]
        );
        return {
          status: true,
          message: "Booking Successful",
          data: resultBooking[0],
        };
      } else {
        return {
          status: false,
          message: "Booking failed",
        };
      }
    } catch (error) {
      console.error("Error occurred while booking", error);
      return {
        status: false,
        message: "Internal Server Error",
      };
    }
  },

  //Modify status appointment
  async ModifyStatus(appointment_id, status) {
    try {
      const resultModify = await knex("APPOINTMENTS")
        .where("appointment_id", appointment_id)
        .update("status", status);
      if (resultModify) {
        return {
          success: true,
          message: "Status updated successfully",
        };
      } else {
        return { success: false, message: "Failed to update status" };
      }
    } catch (error) {
      console.error("Error during update status booking:", error);
      throw error;
    }
  },

  // Lọc giờ được chọn bởi id doctor, id_department, id_service, appointment_date, start_time, shift_id buổi sáng hoặc chiều (Lọc lịch hẹn trùng để nguồi dùng không booking được)
  async TimeBookingExisting({
    doctor_id,
    department_id,
    service_id,
    appointment_date,
    start_time,
    shift_id,
  }) {
    try {
      const existingTimes = await knex("APPOINTMENTS")
        .select("start_time")
        .where("staff_id", doctor_id)
        .andWhere("department_id", department_id)
        .andWhere("service_id", service_id)
        .andWhere("appointment_date", appointment_date)
        .andWhere("shift_id", shift_id)
        .andWhere("start_time", start_time);

      if (existingTimes.length > 0) {
        return {
          status: false,
          message: "Khung giờ này đã có người đặt.",
          data: existingTimes,
        };
      } else {
        return {
          status: true,
          message: "Khung giờ này còn trống và có thể đặt lịch.",
        };
      }
    } catch (error) {
      console.error("Lỗi khi kiểm tra thời gian đặt lịch:", error);
      return {
        status: false,
        message: "Lỗi hệ thống",
      };
    }
  },
};

module.exports = handleBookingService;
