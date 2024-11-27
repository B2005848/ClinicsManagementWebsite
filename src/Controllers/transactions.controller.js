const transactionService = require("../Services/transactions.service");

const transactionController = {
  async getFilteredRevenueStatistics(req, res, next) {
    try {
      const { startDate, endDate, payment_status } = req.body;

      const result = await transactionService.getFilteredRevenueStatistics({
        startDate,
        endDate,
        payment_status,
      });

      if (result.status) {
        console.log(result.data);
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

  // Lấy lịch sử thanh toán DỊCH VỤ ĐẶT LỊCH HẸN KHÁM BỆNH của bệnh nhân
  async getPaymentHistoryByAppointment(req, res, next) {
    try {
      const { patientId } = req.params; // patientId passed as a URL parameter

      const result = await transactionService.getPaymentHistoryByAppointment(
        patientId
      );

      if (result.status) {
        return res.status(200).json({
          status: true,
          message: "Payment history fetched successfully",
          data: result.data,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error fetching payment history by appointment:", error);
      next(new ApiError(500, "Failed to fetch payment history"));
    }
  },
};

module.exports = transactionController;
