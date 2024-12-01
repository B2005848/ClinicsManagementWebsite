const express = require("express");
const accountPatientControllers = require("../Controllers/account.patients.controller");
const router = express.Router();

// =========CREATE ACCOUNT PATIENT============
router.post("/create", accountPatientControllers.createAccount);
router.post("/login", accountPatientControllers.checkLogin);

//==========CHECK EXPIRE OF ACESS TOKEN===========
router.post(
  "/checkExipredAcessToken",
  accountPatientControllers.checkAccessToken
);

//============= REFRESH ACCESS TOKEN ==============
router.post(
  "/refreshAccessToken",
  accountPatientControllers.refreshAccessToken
);

//==========CHECK EXPIRE OF REFRESH TOKEN===========
router.post(
  "/checkExipredRefreshToken",
  accountPatientControllers.checkRefreshToken
);

router.put("/status/update/:id", accountPatientControllers.updateStatusAccount);

// Quên mật khẩu ( Khôi phục tài khoản)
router.put("/change-password/:id", accountPatientControllers.changePassword);

// Route đổi mật khẩu với điều kiện nhập mật khẩu cũ
router.put(
  "/change-password-with-old/:id",
  accountPatientControllers.changePasswordWithOldPassword
);
module.exports = router;
