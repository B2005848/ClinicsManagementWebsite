// src/controllers/otp.controller.js
const { sendOTPEmail } = require("../Services/email.service");

async function sendOtpController(req, res) {
  const { email } = req.body;

  if (!email) {
    return res
      .status(400)
      .json({ status: false, message: "Email is required" });
  }

  const otp = Math.floor(100000 + Math.random() * 900000);

  const response = await sendOTPEmail(email, otp);

  if (response.success) {
    // Bạn có thể lưu OTP vào cơ sở dữ liệu hoặc thực hiện các hành động khác nếu cần.
    return res.status(200).json({
      status: true,
      message: "OTP email sent successfully",
    });
  } else {
    return res.status(500).json({
      status: false,
      message: "Failed to send OTP email",
      error: response.error,
    });
  }
}

module.exports = { sendOtpController };
