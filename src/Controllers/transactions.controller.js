const transactionService = require("../Services/transactions.service");

const transactionController = {
  async getFilteredRevenueStatistics(req, res, next) {
    try {
      const { startDate, endDate, payment_status } = req.body;

      const result =
        await transactionService.getFilteredRevenueStatisticsByService({
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

  // Lấy lịch sử thanh toán DỊCH VỤ ĐẶT LỊCH HẸN KHÁM BỆNH của bệnh nhân theo năm
  async getPaymentHistoryByAppointment(req, res, next) {
    try {
      const { patientId } = req.params; // patientId passed as a URL parameter
      const { year } = req.query; // Lấy tham số year từ query parameters

      // Nếu không có year, sử dụng năm hiện tại
      const currentYear = year || new Date().getFullYear();

      // Gọi service để lấy dữ liệu thanh toán theo patientId và năm
      const result = await transactionService.getPaymentHistoryByAppointment(
        patientId,
        currentYear
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

  // Lấy tổng doanh thu theo năm cho bệnh nhân (bao gồm lịch hẹn và đơn thuốc)
  async getTotalRevenueByYear(req, res, next) {
    try {
      const { patientId } = req.params;
      const { year } = req.query;

      // Nếu không có year, sử dụng năm hiện tại
      const currentYear = year || new Date().getFullYear();

      // Gọi service để tính tổng doanh thu cho bệnh nhân trong năm
      const result = await transactionService.getTotalRevenueByYear(
        patientId,
        currentYear
      );

      if (result.status) {
        return res.status(200).json({
          status: true,
          message: `Total revenue for patient in ${currentYear}`,
          total_revenue: result.total_revenue,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error fetching total revenue:", error);
      next(new ApiError(500, "Failed to fetch total revenue"));
    }
  },

  // Cập nhật trạng thái giao dịch
  async updateTransactionStatus(req, res, next) {
    try {
      const { transactionId } = req.params; // ID giao dịch từ URL params
      const { newStatus } = req.body; // Trạng thái mới từ body

      // Gọi service để cập nhật trạng thái giao dịch
      const result = await transactionService.updateTransactionStatus(
        transactionId,
        newStatus
      );

      if (result.status) {
        return res.status(200).json({
          status: true,
          message: result.message,
        });
      } else {
        return res.status(400).json({
          status: false,
          message: result.message,
        });
      }
    } catch (error) {
      console.error("Error updating transaction status:", error);
      next(new ApiError(500, "Failed to update transaction status"));
    }
  },
};

module.exports = transactionController;
