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

async function sendOTPEmail(to, otp) {
  const mailOptions = {
    from: "ShineOnYou Team",
    to: to,
    subject: "Authentication your number phone(OTP)",
    text: `Your OTP code is ${otp}`,
    html: `
    <html>
      <body>
        <h1>Your OTP Code</h1>
        <p>Thank you for using our sevice</p>
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
    await transporter.sendMail(mailOptions);
    console.log("OTP email sent successfully");
    return { success: true };
  } catch (error) {
    console.error("Error sending OTP email:", error);
    return { success: false, error: error.message };
  }
}

module.exports = { sendOTPEmail };
