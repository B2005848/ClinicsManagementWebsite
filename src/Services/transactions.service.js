const { knex } = require("../../db.config");

const transactionService = {
  async getFilteredRevenueStatisticsByService({
    startDate,
    endDate,
    payment_status,
  }) {
    try {
      // Xây dựng truy vấn động
      const query = knex("TRANSACTIONS as t")
        .join("APPOINTMENTS as a", "t.appointment_id", "a.appointment_id") // Kết nối với bảng appointments
        .leftJoin("SERVICES as s", "a.service_id", "s.service_id") // Kết nối với bảng services qua bảng appointments
        .select(
          knex.raw("s.service_id"),
          knex.raw("s.service_name"),
          knex.raw("SUM(t.amount) AS total_revenue")
        );

      // Lọc trạng thái thanh toán (nếu có)
      if (payment_status) {
        query.andWhere("t.payment_status", payment_status);
      }

      // Áp dụng bộ lọc khoảng thời gian (nếu có)
      if (startDate && endDate) {
        query.andWhereBetween("t.transaction_date", [startDate, endDate]);
      } else if (startDate) {
        query.andWhere("t.transaction_date", ">=", startDate);
      } else if (endDate) {
        query.andWhere("t.transaction_date", "<=", endDate);
      }

      // Nhóm theo dịch vụ và tính tổng doanh thu
      query
        .groupBy("s.service_id", "s.service_name")
        .orderBy("total_revenue", "desc"); // Sắp xếp theo tổng doanh thu giảm dần

      console.log(query.toString()); // In ra truy vấn SQL để kiểm tra

      // Thực thi truy vấn và lấy dữ liệu
      const data = await query;

      // Trả về kết quả
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
