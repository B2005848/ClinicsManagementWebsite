// src/controllers/otp.controller.js
const { emailService } = require("../Services/email.service");

const emailControllers = {
  async sendOtpPatientController(req, res) {
    const { email } = req.body;

    if (!email) {
      return res
        .status(400)
        .json({ status: false, message: "Email is required" });
    }

    //Math.random(): x --> 0.0 <= x < 1
    // 100.000 <= otp <= 999.999
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

  // -----------------------------------check otp by username
  async checkOtpPatientController(req, res) {
    const { otp, patient_id } = req.body;

    try {
      const response = await emailService.checkOtpByPatientId(patient_id, otp);

      // success == true
      if (response.success) {
        return res.status(200).json({
          status: true,
          message: response.message,
        });
      } else {
        // success == false
        if (!response.success) {
          return res.status(400).json({
            status: false,
            message: response.message,
          });
        } else {
          return res.status(500).json({
            status: false,
            message: "An error occurred while verifying OTP",
            error: response.error || "Unknown error",
          });
        }
      }
    } catch (error) {
      console.error("Error in checkOtpController:", error);
      return res.status(500).json({
        status: false,
        message: "Internal server error",
        error: error.message,
      });
    }
  },
};

module.exports = { emailControllers };
