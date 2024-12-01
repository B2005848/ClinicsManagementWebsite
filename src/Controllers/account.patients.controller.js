const ApiError = require("../api-error");
const accountPatientServices = require("../Services/account.patients.service");
const moment = require("moment");

const accountPatientControllers = {
  async createAccount(req, res, next) {
    try {
      const first_name = req.body?.first_name;
      const last_name = req.body?.last_name;
      const username = req.body?.username;
      const password = req.body?.password;
      const phone = req.body?.phone;
      const email = req.body?.email;
      const gender = req.body?.gender;
      const major = req.body?.major;
      const citizen_id = req.body?.citizen_id;
      const address_contact = req.body?.address_contact;
      const health_insurance_id = req.body?.health_insurance_id;
      const nationality = req.body?.nationality;
      const religion = req.body?.religion;
      const nation = req.body?.nation;
      if (!first_name && !last_name) {
        return next(new ApiError(400, "Name is required"));
      }
      if (!username) {
        return next(new ApiError(400, "Username is required"));
      }
      if (!password) {
        return next(new ApiError(400, "Password is required"));
      }
      let birthday =
        req.body?.birthday !== undefined ? req.body?.birthday : null;
      if (birthday) {
        //input DD/MM/YYYY
        birthday = moment(birthday, "DD/MM/YYYY").format("YYYY-MM-DD");
      }
      const accountData = {
        patient_id: username,
        password: password,
      };

      const patient_detailsData = {
        first_name: first_name,
        last_name: last_name,
        birthday: birthday,
        phone_number: phone,
        email: email,
        gender: gender,
        major: major,
        citizen_id: citizen_id,
        address_contact: address_contact,
        health_insurance_id: health_insurance_id,
        nation: nation,
        religion: religion,
        nationality: nationality,
      };
      const resultCreate_account = await accountPatientServices.createAccount(
        accountData,
        patient_detailsData
      );
      if (resultCreate_account.status === true) {
        return res.status(201).json({
          message: resultCreate_account.message,
          data: resultCreate_account.data,
        });
      } else {
        return next(new ApiError(400, "Account already exists"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  async checkLogin(req, res, next) {
    try {
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
      if (resultCheckLogin.success === true) {
        return res.status(200).json({
          message: "Login successful",
          accessToken: resultCheckLogin.accessToken,
          refreshToken: resultCheckLogin.refreshToken,
          accessTokenExpiry: resultCheckLogin.accessTokenExpiry,
          refreshTokenExpiry: resultCheckLogin.refreshTokenExpiry,
        });
      } else {
        return next(new ApiError(400, "Invalid username or password"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------REFRESH ACCESS TOKEN----------------------------------------------------------
  async refreshAccessToken(req, res, next) {
    try {
      console.log("Request body: ", req.body);
      const { refreshToken } = req.body; // Nhận refresh token từ request body
      const result = await accountPatientServices.refreshAccessToken(
        refreshToken
      );

      if (result.success) {
        return res.status(200).json(result);
      } else {
        return next(new ApiError(403, result.message)); // Trả về lỗi nếu không thành công
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------CHECK ACCESS TOKEN----------------------------------------------------------
  async checkAccessToken(req, res, next) {
    try {
      const { accessToken } = req.body; // Nhận access token từ request body

      if (!accessToken) {
        return next(new ApiError(400, "Access token is required"));
      }

      const result = await accountPatientServices.checkAccessToken(accessToken); // Gọi dịch vụ để kiểm tra token

      if (result.success) {
        return res.status(200).json({
          message: "Access token is valid",
          staff_id: result.staff_id,
          username: result.username,
          expiresAt: result.expiresAt,
        });
      } else {
        return next(new ApiError(401, result.message)); // Trả về lỗi nếu token không hợp lệ
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------CHECK REFRESH TOKEN----------------------------------------------------------
  async checkRefreshToken(req, res, next) {
    try {
      const { refreshToken } = req.body; // Nhận access token từ request body

      if (!refreshToken) {
        return next(new ApiError(400, "Refresh token is required"));
      }

      const result = await accountPatientServices.checkRefreshToken(
        refreshToken
      ); // Gọi dịch vụ để kiểm tra token

      if (result.success) {
        return res.status(200).json({
          message: "Access token is valid",
          staff_id: result.staff_id,
          expiresAt: result.expiresAt,
        });
      } else {
        return next(new ApiError(401, result.message)); // Trả về lỗi nếu token không hợp lệ
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ------------------------------UPDATE STATUS ACCOUNT-----------------------------------------
  async updateStatusAccount(req, res, next) {
    try {
      const patient_id = req.params.id;
      const status = req.body.status;
      const resultUpdateStatus =
        await accountPatientServices.updateStatusAccount(patient_id, status);
      if (resultUpdateStatus.success === true) {
        return res.status(200).json({
          message: "Status updated",
          data: resultUpdateStatus.data,
        });
      } else {
        return next(new ApiError(400, "Failed to update status"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------CHANGE PASSWORD----------------------------------------------------------
  async changePassword(req, res, next) {
    try {
      const patient_id = req.params.id; // Lấy patient_id từ tham số đường dẫn
      const new_password = req.body?.new_password; // Lấy mật khẩu mới từ body

      // Kiểm tra xem mật khẩu mới có tồn tại không
      if (!new_password) {
        return next(new ApiError(400, "New password is required"));
      }

      // Gọi service để xử lý đổi mật khẩu
      const resultChangePassword = await accountPatientServices.changePassword(
        patient_id,
        new_password
      );

      // Kiểm tra kết quả trả về từ service
      if (resultChangePassword.status === true) {
        return res.status(200).json({
          message: resultChangePassword.message,
        });
      } else {
        return next(new ApiError(400, resultChangePassword.message));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------CHANGE PASSWORD WITH OLD PASSWORD----------------------------------------------------------
  async changePasswordWithOldPassword(req, res, next) {
    try {
      const patient_id = req.params.id; // Lấy patient_id từ tham số đường dẫn
      const { old_password, new_password } = req.body; // Lấy mật khẩu cũ và mật khẩu mới từ body

      // Kiểm tra xem mật khẩu cũ và mật khẩu mới có được cung cấp không
      if (!old_password) {
        return next(new ApiError(400, "Vui lòng nhập mật khẩu cũ"));
      }
      if (!new_password) {
        return next(new ApiError(400, "Vui lòng nhập mật khẩu mới"));
      }

      // Kiểm tra mật khẩu cũ có đúng không bằng cách gọi service
      const resultCheckOldPassword =
        await accountPatientServices.checkOldPassword(patient_id, old_password);

      if (!resultCheckOldPassword.isCorrect) {
        return next(new ApiError(400, "Mật khẩu cũ không chính xác"));
      }

      // Gọi service để thực hiện đổi mật khẩu
      const resultChangePassword = await accountPatientServices.changePassword(
        patient_id,
        new_password
      );

      if (resultChangePassword.status === true) {
        return res.status(200).json({
          message: resultChangePassword.message,
        });
      } else {
        return next(new ApiError(400, resultChangePassword.message));
      }
    } catch (error) {
      return next(new ApiError(500, "Lỗi server"));
    }
  },
};

module.exports = accountPatientControllers;
