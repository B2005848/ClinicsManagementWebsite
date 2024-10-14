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
};

module.exports = handleBookingService;
