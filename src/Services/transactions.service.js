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
};

module.exports = transactionService;
