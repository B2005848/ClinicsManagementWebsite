const ApiError = require("../api-error");
const handlePaymentMethodServices = require("../Services/handle.paymentmethod.service");

const handlePaymentMethodControllers = {
  //----------------------------GET LIST PAYMENT METHODS------------------------------
  async getListPaymentMethods(req, res, next) {
    try {
      const result = await handlePaymentMethodServices.getListPaymentMethod();
      if (result.status === true) {
        return res.status(200).json({
          message: result.message,
          data: result.ListPayMentMethod,
        });
      } else {
        return next(new ApiError(404, "No payment methods found"));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  //----------------------------CREATE NEW PAYMENT METHOD------------------------------
  async createPaymentMethod(req, res, next) {
    try {
      // Nhận dữ liệu từ body của request
      const { method_name, description, is_active } = req.body;

      // Gọi service để thực hiện tạo phương thức thanh toán mới
      const result = await handlePaymentMethodServices.createPaymentMethod({
        method_name,
        description,
        is_active,
      });

      // Kiểm tra nếu việc tạo phương thức thanh toán thành công
      if (result.status === true) {
        return res.status(201).json({
          message: result.message,
          paymentMethodId: result.paymentMethodId, // Trả về ID của phương thức vừa tạo
        });
      } else if (result.message === "Payment method already exists") {
        // Nếu phương thức thanh toán đã tồn tại, trả về lỗi 409 (Conflict)
        return res.status(409).json({
          message: result.message,
        });
      } else {
        // Trường hợp tạo thất bại vì lý do khác
        return next(new ApiError(400, result.message));
      }
    } catch (error) {
      console.error("Error in createPaymentMethod controller:", error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  //----------------------------UPDATE PAYMENT METHOD------------------------------
  async updatePaymentMethod(req, res, next) {
    try {
      const paymentMethodId = req.params.id;
      const { method_name, description, is_active } = req.body;
      const result = await handlePaymentMethodServices.updatePaymentMethod(
        paymentMethodId,
        {
          method_name,
          description,
          is_active,
        }
      );

      if (result.status === true) {
        return res.status(200).json({
          message: result.message,
        });
      } else {
        return next(
          new ApiError(404, "Payment method not found or update failed")
        );
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  //----------------------------DELETE PAYMENT METHOD------------------------------
  async deletePaymentMethod(req, res, next) {
    try {
      const paymentMethodId = req.params.id;
      const result = await handlePaymentMethodServices.deletePaymentMethod(
        paymentMethodId
      );

      if (result.status === true) {
        return res.status(200).json({
          message: result.message,
        });
      } else {
        return next(
          new ApiError(404, "Payment method not found or delete failed")
        );
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = handlePaymentMethodControllers;
