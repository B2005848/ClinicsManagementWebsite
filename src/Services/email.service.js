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
      from: "ShineOnYou Customer",
      to: to,
      subject: "Verify your phone number(OTP)",
      text: `Your OTP code is ${otp}`,
      html: `
    <html>
      <body>
        <h1>Your OTP Code</h1>
        <p>Thank ${patient.first_name} ${patient.last_name} for using our sevice</p>
        <p>Your OTP code is <strong>${otp}</strong></p>
        <img src="cid:unique@kreata.ee" alt="OTP Image" style="max-width: 100%; height: auto;" />
      </body>
    </html>
  `,
      attachments: [
        {
          filename: "image.jpg",
          path: path.join(__dirname, "../../images/HealthFirst.png"),
          // id'src image to src = id
          cid: "unique@kreata.ee",
        },
      ],
    };
    try {
      if (patient.patient_id) {
        const resultSendMail = await transporter.sendMail(mailOptions);
        if (resultSendMail) {
          console.log("OTP email sent successfully");
          const resultSaveOtp = await knex(
            "ACCOUNT_DELETION_PATIENT_OTP"
          ).insert({
            patient_id: patient.patient_id,
            email: to,
            otp: otp,
            // set exp in 20 seconds
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

  async checkOtpByPatientId(patient_id, otp) {
    try {
      const otpResult = await knex("ACCOUNT_DELETION_PATIENT_OTP")
        .select("otp", "created_at", "expires_in_seconds")
        .where("patient_id", patient_id)
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
      console.log(
        "Otp is expired(false is No or true is Yes) ",
        t2.isAfter(t1)
      );

      /* ---------------------------------------------PAST TIME -------------------------CURRENT TIME---------------------------FUTURE TIME
      |------------------------------------------------|---------------------------------------|---------------------------------------|-----
      |-----------------------------------------2024-09-03 20:55:57------------------2024-09-03 20:56:04.369------------------------and then|
      */
      // check expirationTime is after? if expirationTime is not after become, (currentTimeLocal.isAfter(expirationTime)) will reuturn false
      // after become: 11:00 is after become 11:01, 12:00.......
      if (t2.isAfter(t1)) {
        return {
          success: true,
          message: "OTP has expired",
        };
      } else {
        return {
          // success is false: expirationTime is after currentTimeLocal
          success: false,
          message: "OTP is correct and not expired",
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
