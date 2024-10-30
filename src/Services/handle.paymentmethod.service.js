const { knex } = require("../../db.config");
require("dotenv").config();
const handlePaymentMethodServices = {
  //-----------------------------GET LIST PAYMENT METHOD--------------------------
  async getListPaymentMethod() {
    try {
      const result = await knex("PAYMENT_METHOD").select("*");
      if (result.length === 0) {
        return {
          status: false,
          message: "Get list payment method fails",
        };
      } else {
        return {
          status: true,
          message: "get list payment method success",
          ListPayMentMethod: result,
        };
      }
    } catch (error) {
      console.error("Error during get list payment method :", error);
      throw error;
    }
  },

  // -------------------------CREATE A NEW PAYMENT METHOD--------------------------
  async createPaymentMethod(data) {
    try {
      // Kiểm tra xem phương thức thanh toán với tên này đã tồn tại chưa
      const checkPaymentMethodExisting = await knex("PAYMENT_METHOD")
        .select()
        .where({ method_name: data.method_name })
        .first(); // Lấy bản ghi đầu tiên nếu có

      // Nếu đã tồn tại phương thức thanh toán với tên này
      if (checkPaymentMethodExisting) {
        return {
          status: false,
          message: "Payment method already exists",
        };
      }

      // Chèn phương thức thanh toán mới nếu chưa tồn tại
      const result = await knex("PAYMENT_METHOD").insert({
        method_name: data.method_name,
        description: data.description,
        is_active: data.is_active || 1, // Mặc định giá trị là 1 (active) nếu không có
      });

      return {
        status: true,
        message: "Create payment method success",
        paymentMethodId: result[0], // Trả về ID của phương thức thanh toán vừa được tạo
      };
    } catch (error) {
      console.error("Error during creating payment method:", error);
      return {
        status: false,
        message: "Create payment method failed",
        error: error.message,
      };
    }
  },

  // --------------------------MODIFY A ANY PAYMENT METHOD-----------------------
  async updatePaymentMethod(paymentMethodId, data) {
    try {
      const result = await knex("PAYMENT_METHOD")
        .where("payment_method_id", paymentMethodId)
        .update({
          method_name: data.method_name,
          description: data.description,
          is_active: data.is_active,
        });

      if (result) {
        return {
          status: true,
          message: "Update payment method success",
        };
      } else {
        return {
          status: false,
          message: "Update payment method failed. No rows affected.",
        };
      }
    } catch (error) {
      console.error("Error during updating payment method:", error);
      return {
        status: false,
        message: "Update payment method failed",
        error: error.message,
      };
    }
  },

  // --------------------------------DELETE ANY PAYMENT METHOD---------------------------
  async deletePaymentMethod(paymentMethodId) {
    try {
      const result = await knex("PAYMENT_METHOD")
        .where({ payment_method_id: paymentMethodId })
        .del();

      if (result) {
        return {
          status: true,
          message: "Delete payment method success",
        };
      } else {
        return {
          status: false,
          message: "Delete payment method failed. No rows affected.",
        };
      }
    } catch (error) {
      console.error("Error during deleting payment method:", error);
      return {
        status: false,
        message: "Delete payment method failed",
        error: error.message,
      };
    }
  },
};

module.exports = handlePaymentMethodServices;
