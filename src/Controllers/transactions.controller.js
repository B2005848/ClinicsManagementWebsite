const transactionService = require("../Services/transactions.service");

const transactionController = {
  async getFilteredRevenueStatistics(req, res, next) {
    try {
      const { startDate, endDate, payment_status } = req.query;

      const result = await transactionService.getFilteredRevenueStatistics({
        startDate,
        endDate,
        payment_status,
      });

      if (result.status) {
        return res.status(200).json({
          status: true,
          message: "Revenue statistics fetched successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error fetching filtered revenue statistics:", error);
      next(new ApiError(500, "Failed to fetch revenue statistics"));
    }
  },
};

module.exports = transactionController;
