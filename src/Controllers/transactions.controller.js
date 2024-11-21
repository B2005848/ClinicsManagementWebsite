const transactionService = require("../Services/transactions.service");

const transactionController = {
  async getFilteredRevenueStatistics(req, res, next) {
    try {
      const { day, month, year } = req.query;

      // Kiểm tra tham số `year` (bắt buộc)
      if (!year) {
        return res.status(400).json({
          status: false,
          message: "Year is required for filtering revenue statistics.",
        });
      }

      const result = await transactionService.getFilteredRevenueStatistics({
        day: day ? parseInt(day, 10) : null,
        month: month ? parseInt(month, 10) : null,
        year: parseInt(year, 10),
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
