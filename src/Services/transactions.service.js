const { knex } = require("../../db.config");

const transactionService = {
  async getFilteredRevenueStatistics({ day, month, year }) {
    try {
      // Xây dựng truy vấn động
      const query = knex("TRANSACTIONS")
        .select(
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
        )
        .where("payment_status", "C");

      // Áp dụng bộ lọc
      if (year) {
        query.andWhere(knex.raw("YEAR(transaction_date) = ?", [year]));
      }
      if (month) {
        query.andWhere(knex.raw("MONTH(transaction_date) = ?", [month]));
      }
      if (day) {
        query.andWhere(knex.raw("DAY(transaction_date) = ?", [day]));
      }

      query
        .groupByRaw(
          "YEAR(transaction_date), MONTH(transaction_date), DAY(transaction_date)"
        )
        .orderByRaw(
          "YEAR(transaction_date), MONTH(transaction_date), DAY(transaction_date)"
        );

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
