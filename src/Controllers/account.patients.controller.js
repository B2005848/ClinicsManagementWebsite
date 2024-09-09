const ApiError = require("../api-error");
const accountPatientServices = require("../Services/account.patients.service");

const accountPatientControllers = {
  async createAccount(req, res, next) {
    const first_name = req.body?.first_name;
    const last_name = req.body?.last_name;
    const username = req.body?.username;
    const password = req.body?.password;
    let birthday = req.body?.birthday !== undefined ? req.body?.birthday : null;
    const email = req.body?.email;

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
      email: email,
    };
    const resultCreate_account = await accountPatientServices.createAccount(
      accountData,
      patient_detailsData
    );
    if (resultCreate_account.status === true) {
      return res.status(201).json({
        message: "An account created",
        data: resultCreate_account.data,
      });
    } else {
      return next(new ApiError(400, "Account already exists"));
    }
  },

  async checkLogin(req, res, next) {
    const username = req.body?.username;
    const password = req.body?.password;

    if (!username) {
      return next(new ApiError(400, "Username is required"));
    }
    if (!password) {
      return next(new ApiError(400, "Password is required"));
    }
    const resultCheckLogin = await accountPatientServices.checkLogin(
      username,
      password
    );
    if (resultCheckLogin) {
      return res.status(200).json({
        message: "Login successful",
        token: resultCheckLogin.token,
      });
    } else {
      return next(new ApiError(400, "Invalid username or password"));
    }
  },
};

module.exports = accountPatientControllers;
