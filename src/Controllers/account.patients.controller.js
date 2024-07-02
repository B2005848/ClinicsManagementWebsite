const ApiError = require("../api-error");
const accountService = require("../Services/account.patients.service");

async function createAccount(req, res, next) {
  const name = req.body?.name;
  const username = req.body?.username;
  const password = req.body?.password;
  if (!name) {
    return next(new ApiError(400, "Name is required"));
  }
  if (!username) {
    return next(new ApiError(400, "Username is required"));
  }
  if (!password) {
    return next(new ApiError(400, "Password is required"));
  }
  const accountData = {
    username: username,
    password: password,
  };

  const patient_detailsData = {
    name: name,
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
};
