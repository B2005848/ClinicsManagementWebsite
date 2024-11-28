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

  // Lấy lịch sử thanh toán DỊCH VỤ ĐẶT LỊCH HẸN KHÁM BỆNH của bệnh nhân theo năm
  async getPaymentHistoryByAppointment(patientId, year) {
    try {
      // Truy vấn lịch sử thanh toán theo patient_id và các thông tin chi tiết liên quan, thêm điều kiện lọc theo năm
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
        .andWhereRaw("YEAR(t.transaction_date) = ?", [year]) // Lọc theo năm của transaction_date
        .orderBy("t.transaction_date", "desc"); // Sắp xếp theo ngày giao dịch

      const data = await query;

      if (data.length === 0) {
        return {
          status: false,
          message: `No payment history found for this patient in ${year}.`,
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

  // Lấy tổng doanh thu cho bệnh nhân trong năm theo trạng thái C (Hoàn thành)
  async getTotalRevenueByYear(patientId, year) {
    try {
      const query = knex("TRANSACTIONS as t")
        .select(
          "t.transaction_id",
          "t.amount",
          "t.transaction_date",
          "t.payment_status",
          "t.bankCode"
        )
        .where("t.patient_id", patientId)
        .andWhereRaw("YEAR(t.transaction_date) = ?", [year]) // Lọc theo năm
        .andWhere("t.payment_status", "C") // Chỉ lấy giao dịch có trạng thái "C" (Hoàn thành)
        .orderBy("t.transaction_date", "desc");

      const data = await query;

      if (data.length === 0) {
        return {
          status: false,
          message: `No completed transactions found for this patient in ${year}.`,
        };
      }

      // Tính tổng tiền các giao dịch đã hoàn thành
      const totalRevenue = data.reduce(
        (sum, transaction) => sum + transaction.amount,
        0
      );

      return {
        status: true,
        total_revenue: totalRevenue,
      };
    } catch (error) {
      console.error("Error fetching total revenue:", error);
      return {
        status: false,
        message: "Failed to fetch total revenue",
        error,
      };
    }
  },

  // Hàm cập nhật trạng thái giao dịch
  async updateTransactionStatus(transactionId, newStatus) {
    try {
      // X: là trạng thái chưa thanh toán
      // P: đang xử lí
      // C: đã thanh toán
      // F: với VNPay thanh toán thất bại

      // Cập nhật trạng thái giao dịch
      const result = await knex("TRANSACTIONS")
        .where("transaction_id", transactionId)
        .update({
          payment_status: newStatus,
        });

      if (result === 0) {
        return {
          status: false,
          message: "Transaction not found or no change in status.",
        };
      }

      return {
        status: true,
        message: `Transaction status updated to ${newStatus}.`,
      };
    } catch (error) {
      console.error("Error updating transaction status:", error);
      return {
        status: false,
        message: "Failed to update transaction status.",
        error,
      };
    }
  },
};

module.exports = transactionService;
