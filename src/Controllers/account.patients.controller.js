const ApiError = require("../api-error");
const accountService = require("../Services/account.patients.service");

async function sendOtpToPhone(req, res) {
  const { phoneNumber } = req.body;

  if (!phoneNumber) {
    return res.status(400).json({ message: "Phone number is required" });
  }

  // Tạo OTP ngẫu nhiên
  const otp = Math.floor(100000 + Math.random() * 900000);

  // Gửi OTP qua SMS
  const otpResult = await accountService.sendOTP(phoneNumber, otp);

  if (!otpResult.success) {
    return res
      .status(500)
      .json({ message: "Failed to send OTP", error: otpResult.error });
  }

  return res.status(200).json({ message: "OTP sent successfully" });
}

async function createAccount(req, res, next) {
  const first_name = req.body?.first_name;
  const last_name = req.body?.last_name;
  const username = req.body?.username;
  const password = req.body?.password;
  let birthday = req.body?.birthday !== undefined ? req.body?.birthday : null;

  if (!first_name && !last_name) {
    return next(new ApiError(400, "Name is required"));
  }
  if (!username) {
    return next(new ApiError(400, "Username is required"));
  }
  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }
  if (birthday) {
    //input DD/MM/YYYY
    const [day, month, year] = birthday.split("/");
    birthday = `${year}-${month}-${day}`; // convert format to YYYY-MM-DD
  }
  const accountData = {
    patient_id: username,
    password: password,
  };

  const patient_detailsData = {
    first_name: first_name,
    last_name: last_name,
    birthday: birthday,
    phone_number: username,
  };
  const resultCreate_account = await accountService.createAccount(
    accountData,
    patient_detailsData
  );
  if (resultCreate_account) {
    return res.status(201).json({
      message: "An account created",
      data: resultCreate_account.data,
    });
  } else {
    return next(new ApiError(400, "Account already exists"));
  }
}

async function checkLogin(req, res, next) {
  const username = req.body?.username;
  const password = req.body?.password;

  if (!username) {
    return next(new ApiError(400, "Username is required"));
  }
  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }
  const resultCheckLogin = await accountService.checkLogin(username, password);
  if (resultCheckLogin) {
    return res.status(200).json({
      message: "Login successful",
    });
  } else {
    return next(new ApiError(400, "Invalid username or password"));
  }
}

module.exports = {
  createAccount,
  checkLogin,
  sendOtpToPhone,
};
