const { knex } = require("../../db.config");
require("dotenv").config();

const handleBookingService = {
  async AppointmentBooking(bookingData) {
    try {
      const resultBooking = await knex("APPOINTMENTS").insert(bookingData);
      if (resultBooking) {
        console.log(
          `Booking ID: ${resultBooking[0]} has been successfully booked`,
          [resultBooking]
        );
        return {
          status: true,
          message: "Booking Successfull",
          data: [resultBooking],
        };
      }
    } catch (error) {
      console.error("Error occured booking", error);
    }
  },
};

module.exports = handleBookingService;
