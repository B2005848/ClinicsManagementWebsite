const ApiError = require("../api-error");
const handleVNPAYServices = require("../Services/handle.VNPay.services");

const paymentVNPayController = {
  // --------------------------- Tạo URL thanh toán cho lịch hẹn --------------------------
  async createVNPayPaymentForAppointment(req, res, next) {
    try {
      const { amount, bankCode, ipAddr, patient_id, appointment_id } = req.body;

      // Gọi service để tạo URL thanh toán
      const paymentUrl =
        await handleVNPAYServices.createVNPayPaymentForAppointment(
          amount,
          bankCode,
          ipAddr,
          patient_id,
          appointment_id
        );

      // Trả về URL thanh toán cho client
      res.status(200).json({ code: "00", message: "Success", paymentUrl });
    } catch (error) {
      next(new ApiError(400, "Error creating VNPay payment for appointment"));
    }
  },

  // --------------------------- Tạo URL thanh toán cho đơn thuốc --------------------------
  async createVNPayPaymentForPrescription(req, res, next) {
    try {
      const {
        amount,
        bankCode,
        ipAddr,
        patient_id,
        prescription_id,
        payment_method_id,
      } = req.body;

      // Gọi service để tạo URL thanh toán
      const paymentUrl =
        await handleVNPAYServices.createVNPayPaymentForPrescription(
          amount,
          bankCode,
          ipAddr,
          patient_id,
          prescription_id,
          payment_method_id
        );

      // Trả về URL thanh toán cho client
      res.status(200).json({ code: "00", message: "Success", paymentUrl });
    } catch (error) {
      next(new ApiError(400, "Error creating VNPay payment for prescription"));
    }
  },

  // -------------------------- Xử lý kết quả trả về từ VNPay -----------------------------
  async handleVNPayReturnUrl(req, res, next) {
    try {
      const query = req.query;

      // Gọi service để xử lý kết quả trả về từ VNPay
      const result = await handleVNPAYServices.handleVNPayReturnUrl(query);

      // Trả về kết quả cho client
      res.status(200).json(result);
    } catch (error) {
      next(new ApiError(400, "Error handling VNPay return"));
    }
  },

  // -------------------------- Hủy giao dịch -----------------------------
  async cancelTransaction(req, res, next) {
    try {
      const { transaction_id, reason } = req.body;

      // Kiểm tra dữ liệu đầu vào
      if (!transaction_id || !reason) {
        return res.status(400).json({
          code: "01",
          message: "Transaction ID and reason are required",
        });
      }

      // Gọi service để hủy giao dịch
      const result = await handleVNPAYServices.cancelTransaction(
        transaction_id,
        reason
      );

      // Trả về kết quả cho client
      if (result.code === "00") {
        res.status(200).json(result);
      } else {
        res.status(400).json({
          code: result.code,
          message: result.message,
          details: result.details || null,
        });
      }
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      next(new ApiError(500, `Error cancelling transaction: ${error.message}`));
    }
  },
};

module.exports = paymentVNPayController;
