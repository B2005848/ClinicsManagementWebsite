// src/services/email-service.js
const { knex } = require("../../db.config");

const nodemailer = require("nodemailer");

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
      subject: "Authentication your number phone(OTP)",
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
            expires_in_seconds: 20,
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
  // --------------------------- function send otp for staff chưa điều chỉnh
  async sendOTPEmailPatient(to, otp) {
    const patient = await knex("PATIENT_DETAILS")
      .where("email", to)
      .select("*")
      .first();
    const mailOptions = {
      from: "ShineOnYou Customer",
      to: to,
      subject: "Authentication your number phone(OTP)",
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
            expires_in_seconds: 20,
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
};

module.exports = {
  emailService,
};
