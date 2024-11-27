const { knex } = require("../../db.config");

const transactionService = {
  async getFilteredRevenueStatistics({ startDate, endDate, payment_status }) {
    try {
      // Xây dựng truy vấn động
      const query = knex("TRANSACTIONS").select(
        knex.raw("YEAR(transaction_date) AS transaction_year"),
        knex.raw("MONTH(transaction_date) AS transaction_month"),
        knex.raw("DAY(transaction_date) AS transaction_day"),
        knex.raw(`
            SUM(CASE 
              WHEN appointment_id IS NOT NULL THEN amount
              ELSE 0
            END) AS revenue_appointment
          `),
        knex.raw(`
            SUM(CASE 
              WHEN prescription_id IS NOT NULL THEN amount
              ELSE 0
            END) AS revenue_prescription
          `),
        knex.raw("SUM(amount) AS total_revenue")
      );

      // Lọc trạng thái giao dịch
      if (payment_status) {
        query.andWhere("payment_status", payment_status);
      }

      // Áp dụng bộ lọc khoảng thời gian
      if (startDate && endDate) {
        query.andWhereBetween("transaction_date", [startDate, endDate]);
      } else if (startDate) {
        query.andWhere("transaction_date", ">=", startDate);
      } else if (endDate) {
        query.andWhere("transaction_date", "<=", endDate);
      }

      query
        .groupByRaw(
          "YEAR(transaction_date), MONTH(transaction_date), DAY(transaction_date)"
        )
        .orderByRaw(
          "YEAR(transaction_date), MONTH(transaction_date), DAY(transaction_date)"
        );
      console.log(query.toString());

      const data = await query;

      return { status: true, data };
    } catch (error) {
      console.error("Error fetching filtered revenue statistics:", error);
      return {
        status: false,
        message: "Failed to fetch revenue statistics",
        error,
      };
    }
  },

  // Lấy lịch sử thanh toán DỊCH VỤ ĐẶT LỊCH HẸN KHÁM BỆNH của bệnh nhân
  async getPaymentHistoryByAppointment(patientId) {
    try {
      // Truy vấn lịch sử thanh toán theo patient_id và các thông tin chi tiết liên quan
      const query = knex("TRANSACTIONS as t")
        .select(
          "t.transaction_id",
          "t.amount",
          "t.transaction_date",
          "t.payment_status",
          "t.bankCode",
          "a.appointment_id",
          "a.appointment_date",
          "s.service_name",
          "a.start_time",
          "a.end_time"
        )
        .innerJoin("APPOINTMENTS as a", "t.appointment_id", "a.appointment_id")
        .innerJoin("SERVICES as s", "a.service_id", "s.service_id")
        .where("t.patient_id", patientId)
        .andWhereNot("a.appointment_id", null) // Đảm bảo chỉ lấy những giao dịch liên quan đến lịch hẹn
        .orderBy("t.transaction_date", "desc"); // Sắp xếp theo ngày giao dịch

      const data = await query;

      if (data.length === 0) {
        return {
          status: false,
          message: "No payment history found for this patient.",
        };
      }

      return { status: true, data };
    } catch (error) {
      console.error("Error fetching payment history by appointment:", error);
      return {
        status: false,
        message: "Failed to fetch payment history",
        error,
      };
    }
  },
};

module.exports = transactionService;
