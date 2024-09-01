// src/controllers/otp.controller.js
const { emailService } = require("../Services/email.service");

const emailControllers = {
  async sendOtpController(req, res) {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    const otp = Math.floor(100000 + Math.random() * 900000);

    const response = await emailService.sendOTPEmailPatient(email, otp);

    if (response.success) {
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
  },
};

module.exports = { emailControllers };
