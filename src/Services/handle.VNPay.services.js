const { knex } = require("../../db.config"); // Đảm bảo rằng 'knex' đã được khởi tạo đúng
const querystring = require("qs");
const crypto = require("crypto");
require("dotenv").config(); // Nạp biến môi trường từ tệp .env

// Sử dụng biến môi trường từ .env
const { VNP_TMNCODE, VNP_HASHSECRET, VNP_URL, VNP_RETURNURL } = process.env;

// console.log("VNP_TMNCODE:", process.env.VNP_TMNCODE);
// console.log("VNP_HASHSECRET:", process.env.VNP_HASHSECRET);
// console.log("VNP_URL:", process.env.VNP_URL);
// console.log("VNP_RETURNURL:", process.env.VNP_RETURNURL);

const handleVNPAYServices = {
  async createVNPayPaymentForAppointment(
    amount,
    bankCode,
    ipAddr,
    patient_id,
    appointment_id
  ) {
    const date = new Date();

    // Tạo giao dịch và lấy transaction_id từ SQL Server
    let transaction_id;
    try {
      const [transaction] = await knex("TRANSACTIONS")
        .insert({
          patient_id,
          appointment_id,
          payment_method_id: 2,
          bankCode,
          amount,
          payment_status: "P", // P: Pending
        })
        .returning("transaction_id");
      await knex("APPOINTMENTS")
        .where("appointment_id", appointment_id)
        .update("payment_method_id", 2);
      transaction_id = transaction.transaction_id;
    } catch (error) {
      console.error("Error inserting appointment transaction:", error);
      throw new Error("Error creating appointment transaction");
    }

    // Tạo các tham số VNPay
    const vnp_TxnRef = String(transaction_id); // Đảm bảo vnp_TxnRef là chuỗi
    const vnp_OrderInfo = `Thanh-toan-lich-hen-${appointment_id}`;
    const vnp_CreateDate = `${date.getFullYear()}${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}${("0" + date.getDate()).slice(-2)}${(
      "0" + date.getHours()
    ).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${(
      "0" + date.getSeconds()
    ).slice(-2)}`;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMNCODE, // Lấy giá trị từ process.env
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền nhân với 100
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_OrderType: "billpayment",
      vnp_Locale: "vn",
      vnp_ReturnUrl: VNP_RETURNURL, // Lấy giá trị từ process.env
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: vnp_CreateDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    delete vnp_Params["vnp_SecureHash"];
    delete vnp_Params["vnp_SecureHashType"];

    // Sắp xếp các tham số theo thứ tự bảng chữ cái
    vnp_Params = this.sortObject(vnp_Params);

    // In tham số đã sắp xếp để kiểm tra
    console.log("Sorted Params:", vnp_Params);

    // Tạo chữ ký cho yêu cầu thanh toán
    const signData = querystring.stringify(vnp_Params);
    console.log("Tham số tạo chữ ký:", signData); // Kiểm tra dữ liệu trước khi tạo chữ ký

    const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    console.log("Signed Hash:", signed); // Kiểm tra chữ ký được tạo

    vnp_Params["vnp_SecureHash"] = signed;

    // Tạo URL chuyển hướng người dùng sang VNPay
    const paymentUrl = `${VNP_URL}?${querystring.stringify(vnp_Params)}`;
    console.log("Final Payment URL:", paymentUrl); // Kiểm tra URL thanh toán đầy đủ

    return paymentUrl;
  },

  //--------------------------------------- Hàm tạo URL thanh toán VNPay cho đơn thuốc
  async createVNPayPaymentForPrescription(
    amount,
    bankCode,
    ipAddr,
    patient_id,
    prescription_id,
    payment_method_id
  ) {
    const date = new Date();

    // Tạo giao dịch và lấy transaction_id từ SQL Server
    let transaction_id;
    try {
      const [transaction] = await knex("TRANSACTIONS")
        .insert({
          patient_id,
          prescription_id,
          payment_method_id,
          bankCode,
          amount,
          payment_status: "P", // P: Pending
        })
        .returning("transaction_id"); // Lấy mã giao dịch mới tạo

      transaction_id = transaction.transaction_id;
    } catch (error) {
      console.error("Error inserting prescription transaction:", error);
      throw new Error("Error creating prescription transaction");
    }

    // Tạo các tham số VNPay
    const vnp_TxnRef = transaction_id; // Sử dụng transaction_id làm tham chiếu
    const vnp_OrderInfo = `Thanh-toan-don-thuoc-${prescription_id}`;
    const vnp_CreateDate = `${date.getFullYear()}${(
      "0" +
      (date.getMonth() + 1)
    ).slice(-2)}${("0" + date.getDate()).slice(-2)}${(
      "0" + date.getHours()
    ).slice(-2)}${("0" + date.getMinutes()).slice(-2)}${(
      "0" + date.getSeconds()
    ).slice(-2)}`;

    let vnp_Params = {
      vnp_Version: "2.1.0",
      vnp_Command: "pay",
      vnp_TmnCode: VNP_TMNCODE,
      vnp_Amount: amount * 100, // VNPay yêu cầu số tiền nhân với 100
      vnp_CurrCode: "VND",
      vnp_TxnRef: vnp_TxnRef,
      vnp_OrderInfo: vnp_OrderInfo,
      vnp_OrderType: "billpayment",
      vnp_Locale: "vn",
      vnp_ReturnUrl: VNP_RETURNURL,
      vnp_IpAddr: ipAddr,
      vnp_CreateDate: vnp_CreateDate,
    };

    if (bankCode) {
      vnp_Params["vnp_BankCode"] = bankCode;
    }

    // Loại bỏ vnp_SecureHash trước khi tạo chữ ký
    delete vnp_Params["vnp_SecureHash"];

    // Sắp xếp các tham số theo thứ tự bảng chữ cái
    vnp_Params = this.sortObject(vnp_Params);
    console.log("Sorted Params:", vnp_Params); // Kiểm tra các tham số sau khi sắp xếp
    // Tạo chữ ký cho yêu cầu thanh toán
    const signData = querystring.stringify(vnp_Params);
    const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    vnp_Params["vnp_SecureHash"] = signed;
    console.log("Signed Hash:", signed); // Kiểm tra chữ ký

    // Tạo URL chuyển hướng người dùng sang VNPay
    const paymentUrl = `${VNP_URL}?${querystring.stringify(vnp_Params)}`;
    console.log("Final Payment URL:", paymentUrl); // Kiểm tra URL thanh toán đầy đủ
    return paymentUrl;
  },

  // ------------------------------------------------Hàm xử lý kết quả trả về từ VNPay (chung cho cả lịch hẹn và đơn thuốc)
  async handleVNPayReturnUrl(query) {
    const secureHash = query.vnp_SecureHash;
    delete query.vnp_SecureHash;
    delete query.vnp_SecureHashType;

    query = this.sortObject(query);
    const signData = querystring.stringify(query);
    const hmac = crypto.createHmac("sha512", VNP_HASHSECRET);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      // Xác thực thành công
      const status = query.vnp_ResponseCode === "00" ? "C" : "F"; // 'C' là Complete (hoàn tất), 'F' là Failed (thất bại)

      try {
        // Cập nhật trạng thái thanh toán trong SQL Server qua Knex
        await knex("TRANSACTIONS")
          .where({ transaction_id: query.vnp_TxnRef }) // Sử dụng transaction_id để xác định giao dịch
          .update({
            payment_status: status,
          });

        return { code: "00", message: "Transaction successfully processed" };
      } catch (error) {
        console.error("Error updating transaction:", error);
        throw new Error("Error updating transaction status");
      }
    } else {
      return { code: "97", message: "Checksum failed" };
    }
  },

  // Hàm hủy giao dịch
  async cancelTransaction(transaction_id, reason) {
    try {
      // Tìm giao dịch cần hủy trong SQL Server qua Knex
      const transaction = await knex("TRANSACTIONS")
        .where({ transaction_id })
        .first();

      if (!transaction) {
        return { code: "404", message: "Transaction not found" };
      }

      // Cập nhật trạng thái giao dịch thành 'X' (Cancelled)
      await knex("TRANSACTIONS").where({ transaction_id }).update({
        payment_status: "X", // X: Cancelled
        updated_at: new Date(),
      });

      console.log(`Transaction ${transaction_id} cancelled. Reason: ${reason}`);

      return { code: "00", message: "Transaction cancelled successfully" };
    } catch (error) {
      console.error("Error cancelling transaction:", error);
      return { code: "99", message: "Error cancelling transaction", error };
    }
  },

  // Hàm sắp xếp các object theo thứ tự bảng chữ cái
  sortObject(obj) {
    const sorted = {};
    const keys = Object.keys(obj).sort();
    keys.forEach((key) => {
      sorted[key] = obj[key];
    });
    return sorted;
  },
};

module.exports = handleVNPAYServices;
