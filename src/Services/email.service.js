// src/services/email-service.js
const { knex } = require("../../db.config");

const nodemailer = require("nodemailer");
const moment = require("moment-timezone");
const path = require("path");
// Cấu hình Gmail SMTP
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    // user: "your-email@gmail.com",
    user: process.env.GMAIL_USER,
    // App password in gg email
    pass: process.env.GMAIL_PASS,
  },
});

const emailService = {
  // -------------------------------function send otp for patient
  async sendOTPEmailPatient(to, otp) {
    const patient = await knex("PATIENT_DETAILS")
      .where("email", to)
      .select("*")
      .first();
    const mailOptions = {
      from: "B2005848LUANVANTOTNGHIEPCTU",
      to: to,
      subject: "Xác minh mã (OTP) của bạn",
      text: `Mã OTP của bạn là ${otp}`,
      html: `
    <html>
      <body>
        <h1>MÃ OTP CỦA BẠN</h1>
        <p>Cảm ơn ${patient.first_name} ${patient.last_name} đã sử dụng dịch vụ phòng khám của chúng tôi</p>
        <p>Mã otp của bạn là <strong>${otp}</strong></p>
        <p>Hết hạn trong  <strong>5 phút</strong></p>
        <img src="cid:unique@kreata.ee1" alt="OTP Image" style="max-width: 100%; height: auto;" />
      </body>
    </html>
  `,
      attachments: [
        {
          filename: "image.jpg",
          path: path.join(__dirname, "../../images/CTU_logo.png"),
          // id'src image to src = id
          cid: "unique@kreata.ee1",
        },
      ],
    };
    try {
      if (patient.email) {
        const resultSendMail = await transporter.sendMail(mailOptions);
        if (resultSendMail) {
          console.log("OTP email sent successfully");
          const resultSaveOtp = await knex(
            "ACCOUNT_DELETION_PATIENT_OTP"
          ).insert({
            patient_id: patient.patient_id,
            email: to,
            otp: otp,
            // set exp in 300 seconds = 5 minutes
            expires_in_seconds: 300,
          });
          if (resultSaveOtp) {
            console.log("OTP saved successfully");
            return {
              success: true,
              message: "OTP sent successfully",
            };
          }
        }
      }
    } catch (error) {
      console.error("Error sending OTP email:", error);
      return {
        success: false,
        error: error.message,
      };
    }
  },
  // -------------------------------check otp by patient_id for patient

  async checkOtpByPatientId(email, otp) {
    try {
      const otpResult = await knex("ACCOUNT_DELETION_PATIENT_OTP")
        .select("otp", "created_at", "expires_in_seconds")
        .where("email", email)
        .first();

      if (!otpResult) {
        return {
          success: false,
          message: "No OTP found for this patient ID",
        };
      }

      // Check OTP was entered by patient
      if (otpResult.otp !== otp) {
        return {
          success: false,
          message: "OTP is incorrect",
        };
      }

      // Chuyển đổi thời gian `created_at` từ UTC sang giờ địa phương
      const createdAtUTC = moment.utc(otpResult.created_at);
      const createdAtLocal = createdAtUTC.clone().tz("Asia/Ho_Chi_Minh");

      const expiresIn = otpResult.expires_in_seconds * 1000; // Chuyển đổi thời gian hết hạn từ giây sang milliseconds

      // Tính toán thời gian hết hạn dựa trên thời gian `createdAtLocal`
      const expirationTime = createdAtUTC
        .clone()
        .add(expiresIn, "milliseconds");

      // Lấy thời gian hiện tại theo giờ địa phương
      const currentTimeLocal = moment.tz("Asia/Ho_Chi_Minh");

      // Log for debugging
      console.log(
        "Created At (UTC):",
        createdAtUTC.format("YYYY-MM-DD HH:mm:ss.SSS")
      );
      console.log(
        "Created At (Local):",
        createdAtLocal.format("YYYY-MM-DD HH:mm:ss.SSS")
      );
      console.log("Expires In (ms):", expiresIn);
      console.log(
        "Current Time (Local):",
        currentTimeLocal.format("YYYY-MM-DD HH:mm:ss.SSS")
      );
      console.log(
        "Expiration Time (Local):",
        expirationTime.format("YYYY-MM-DD HH:mm:ss.SSS")
      );
      // t1 is currentTimeLocal
      const t1 = moment(currentTimeLocal.format("YYYY-MM-DD HH:mm:ss.SSS"));
      // t2 is expirationTime
      const t2 = moment(expirationTime.format("YYYY-MM-DD HH:mm:ss.SSS"));

      /* -------------------------------------PAST TIME(expiration time)------------------CURRENT TIME----------------------FUTURE TIME(expiration time)
      |------------------------------------------------|---------------------------------------|---------------------------------------|-----
      |-----------------------------------------2024-09-03 21:30:46.123------------------2024-09-03 21:30:57.557---------------2024-09-03 21:34:15.863|
      */
      // check expirationTime is after? if expirationTime is not after become, (currentTimeLocal.isAfter(expirationTime)) will reuturn false
      // T2 is living in future? yes --> true
      if (t2.isAfter(t1)) {
        console.log("OTP is correct and not expired");
        return {
          success: true,
          message: "OTP is correct and not expired",
        };
      } else {
        console.log("OTP has expired");
        return {
          // success is false: expirationTime is after currentTimeLocal
          success: false,
          message: "OTP has expired",
        };
      }
    } catch (error) {
      console.error("Error checking OTP:", error);
      return {
        success: false,
        message: "An error occurred while checking OTP",
      };
    }
  },
  // --------------------------- function send otp for staff chưa điều chỉnh
};

module.exports = {
  emailService,
};
