const { knex } = require("../../db.config");
require("dotenv").config();

const handleBookingService = {
  // Lấy thông tin tất cả lịch hẹn
  async getAppointmentList(page) {
    try {
      const itemsPerPage = 10; // Số lượng lịch hẹn trên mỗi trang
      const offset = (page - 1) * itemsPerPage; // Tính offset dựa trên số trang

      // Lấy tổng số lượng lịch hẹn
      const totalAppointments = await knex("APPOINTMENTS")
        .count("* as totalCount")
        .first();
      const totalAppointmentsCount = totalAppointments.totalCount;

      // Tính tổng số trang
      const totalPages = Math.ceil(totalAppointmentsCount / itemsPerPage);

      // Kiểm tra nếu trang yêu cầu vượt quá tổng số trang
      if (page > totalPages) {
        return {
          status: false,
          message: `Trang ${page} vượt quá số trang tối đa (${totalPages}). Không có lịch hẹn nào.`,
          totalPages,
          appointmentList: [],
        };
      }

      // Lấy danh sách lịch hẹn theo trang
      const appointmentList = await knex("APPOINTMENTS as ap")
        .select(
          "ap.appointment_id",
          "ap.patient_id",
          "pd.first_name as patient_firstname",
          "pd.last_name as patient_lastname",
          "ap.staff_id",
          "sd.first_name as doctor_firstname",
          "sd.last_name as doctor_lastname",
          "ap.department_id",
          "dep.department_name",
          "ap.service_id",
          "se.service_name",
          "ap.appointment_date",
          "ap.start_time",
          "ap.end_time",
          knex.raw("TRIM(ap.status) as status"),
          knex.raw("TRIM(t.payment_status) as payment_status"),
          "t.transaction_id",
          "ap.reason",
          "ap.created_at",
          "ap.updated_at"
        )
        .join("PATIENT_DETAILS as pd", "pd.patient_id", "ap.patient_id")
        .join("STAFF_DETAILS as sd", "sd.staff_id", "ap.staff_id")
        .join("DEPARTMENTS as dep", "dep.department_id", "ap.department_id")
        .join("SERVICES as se", "se.service_id", "ap.service_id")
        .join("TRANSACTIONS as t", "t.appointment_id", "ap.appointment_id")
        .orderBy("ap.appointment_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);

      // Kiểm tra nếu danh sách lịch hẹn trống
      if (appointmentList.length === 0) {
        console.log(
          "Danh sách lịch hẹn trống. Kiểm tra lại cơ sở dữ liệu hoặc liên hệ admin."
        );
        return {
          status: false,
          message: "Danh sách lịch hẹn trống",
          totalPages,
          appointmentList,
          itemsPerPage,
        };
      } else {
        console.log(
          `Lấy danh sách lịch hẹn thành công. Tổng số lịch hẹn: ${totalAppointmentsCount}`
        );
        console.log("Phản hồi từ getAppointmentList:", {
          appointmentList,
          totalPages,
          itemsPerPage,
        });
        return {
          status: true,
          message: "Danh sách lịch hẹn lấy thành công",
          totalPages,
          appointmentList,
          itemsPerPage,
        };
      }
    } catch (error) {
      console.error("Lỗi trong quá trình lấy danh sách lịch hẹn:", error);
      throw error;
    }
  },

  // Lấy thông tin lịch hẹn theo patient_id
  async getAppointmentsByPatientId(patient_id) {
    try {
      const appointments = await knex("APPOINTMENTS as ap")
        .select(
          "ap.appointment_id",
          "ap.created_at",
          "ap.updated_at",
          "ap.staff_id",
          "sd.first_name",
          "sd.last_name",
          "ap.department_id",
          "dep.department_name",
          "ap.service_id",
          "se.service_name",
          "se.service_fee",
          "ap.appointment_date",
          "ap.start_time",
          "ap.end_time",
          knex.raw("TRIM(ap.status) as status"),
          "t.payment_method_id",
          "t.payment_status",
          "t.bankCode"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "ap.staff_id")
        .join("DEPARTMENTS as dep", "dep.department_id", "ap.department_id")
        .join("SERVICES as se", "se.service_id", "ap.service_id")
        .join("TRANSACTIONS as t", "t.appointment_id", "ap.appointment_id")
        .where("ap.patient_id", patient_id);

      if (appointments.length > 0) {
        return {
          status: true,
          message: "Appointments retrieved successfully",
          data: appointments,
        };
      } else {
        return {
          status: false,
          message: "No appointments found for this patient",
        };
      }
    } catch (error) {
      console.error("Error fetching appointments by patient ID:", error);
      return {
        status: false,
        message: "Internal Server Error",
      };
    }
  },

  // Đặt hẹn
  async AppointmentBooking(bookingData) {
    try {
      // Check appointment exists by start_time, end_time, doctor_id
      const existingAppointment = await knex("APPOINTMENTS")
        .where("staff_id", bookingData.staff_id)
        .andWhere("appointment_date", bookingData.appointment_date)
        .andWhere(function () {
          this.where(function () {
            this.where("start_time", "<", bookingData.end_time).andWhere(
              "end_time",
              ">",
              bookingData.start_time
            );
          });
        })
        .first();

      // If appointment exists, delete it and proceed with new booking
      if (existingAppointment) {
        return {
          status: false,
          message: "Booking fails check time existing",
        };
      } else {
        // If no conflict, directly insert the new booking
        const [resultBooking] = await knex("APPOINTMENTS")
          .insert(bookingData)
          .returning("appointment_id");

        if (resultBooking) {
          console.log(
            `Booking ID: ${resultBooking} has been successfully booked`,
            [resultBooking]
          );
          return {
            status: true,
            message: "Booking Successful",
            data: resultBooking,
          };
        } else {
          return {
            status: false,
            message: "Booking failed",
          };
        }
      }
    } catch (error) {
      console.error("Error occurred while booking", error);
      return {
        status: false,
        message: "Internal Server Error",
      };
    }
  },

  // Thanh toán tại phòng khám với phương thức 1: Thanh toán tại phòng khám
  async addTransaction(transactionData) {
    try {
      // Insert dữ liệu vào bảng TRANSACTIONS
      const [transaction] = await knex("TRANSACTIONS")
        .insert(transactionData)
        .returning("*");
      console.log("Transaction added successfully:", transaction);

      return {
        status: true,
        message: "Transaction added successfully",
        data: transaction,
      };
    } catch (error) {
      console.error("Error adding transaction:", error);
      return {
        status: false,
        message: "Failed to add transaction",
        error,
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

  // Xóa lịch hẹn
  async deleteAppointment(appointment_id) {
    try {
      const deletedCount = await knex("APPOINTMENTS")
        .where("appointment_id", appointment_id)
        .del();
      if (deletedCount > 0) {
        return {
          status: true,
          message: "Appointment deleted successfully",
        };
      } else {
        return {
          status: false,
          message: "Appointment not found or could not be deleted",
        };
      }
    } catch (error) {
      console.error("Error while deleting appointment:", error);
      return {
        status: false,
        message: "Internal Server Error",
      };
    }
  },

  // Lọc danh sách lịch hẹn có status = 'CO-F', payment_status = 'C' và theo staff_id : danh cho bac si
  async getAppointmentsWithStatusPaymentAndStaff(page, staff_id) {
    try {
      const itemsPerPage = 10; // Số lượng lịch hẹn trên mỗi trang
      const offset = (page - 1) * itemsPerPage; // Tính offset dựa trên số trang

      // Lấy tổng số lượng lịch hẹn với các điều kiện đã cho
      const totalAppointments = await knex("APPOINTMENTS as ap")
        .join("TRANSACTIONS as t", "t.appointment_id", "ap.appointment_id")
        .where("ap.status", "C-IN")
        .andWhere("t.payment_status", "C")
        .andWhere("ap.staff_id", staff_id) // Thêm điều kiện lọc theo staff_id
        .count("* as totalCount")
        .first();
      const totalAppointmentsCount = totalAppointments.totalCount;

      // Tính tổng số trang
      const totalPages = Math.ceil(totalAppointmentsCount / itemsPerPage);

      // Kiểm tra nếu trang yêu cầu vượt quá tổng số trang
      if (page > totalPages) {
        return {
          status: false,
          message: `Trang ${page} vượt quá số trang tối đa (${totalPages}). Không có lịch hẹn nào.`,
          totalPages,
          appointmentList: [],
        };
      }

      // Lấy danh sách lịch hẹn theo trang với các điều kiện đã cho
      const appointmentList = await knex("APPOINTMENTS as ap")
        .select(
          "ap.appointment_id",
          "ap.patient_id",
          "pd.first_name as patient_firstname",
          "pd.last_name as patient_lastname",
          "ap.staff_id",
          "sd.first_name as doctor_firstname",
          "sd.last_name as doctor_lastname",
          "ap.department_id",
          "dep.department_name",
          "ap.service_id",
          "se.service_name",
          "ap.appointment_date",
          "ap.start_time",
          "ap.end_time",
          "t.payment_status",
          knex.raw("TRIM(ap.status) as status"),
          "ap.reason",
          "ap.created_at",
          "ap.updated_at"
        )
        .join("PATIENT_DETAILS as pd", "pd.patient_id", "ap.patient_id")
        .join("STAFF_DETAILS as sd", "sd.staff_id", "ap.staff_id")
        .join("DEPARTMENTS as dep", "dep.department_id", "ap.department_id")
        .join("SERVICES as se", "se.service_id", "ap.service_id")
        .join("TRANSACTIONS as t", "t.appointment_id", "ap.appointment_id")
        .where("ap.status", "C-IN")
        .andWhere("t.payment_status", "C")
        .andWhere("ap.staff_id", staff_id) // Lọc theo staff_id
        .orderBy("ap.appointment_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);

      // Kiểm tra nếu danh sách lịch hẹn trống
      if (appointmentList.length === 0) {
        console.log(
          "Danh sách lịch hẹn trống. Kiểm tra lại cơ sở dữ liệu hoặc liên hệ admin."
        );
        return {
          status: false,
          message: "Danh sách lịch hẹn trống",
          totalPages,
          appointmentList,
          itemsPerPage,
        };
      } else {
        console.log(
          `Lấy danh sách lịch hẹn thành công. Tổng số lịch hẹn: ${totalAppointmentsCount}`
        );
        return {
          status: true,
          message: "Danh sách lịch hẹn lấy thành công",
          totalPages,
          appointmentList,
          itemsPerPage,
        };
      }
    } catch (error) {
      console.error("Lỗi trong quá trình lấy danh sách lịch hẹn:", error);
      throw error;
    }
  },
};

module.exports = handleBookingService;
