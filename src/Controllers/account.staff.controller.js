const ApiError = require("../api-error");
const accountStaffService = require("../Services/account.staff.service");
const moment = require("moment");

const accountStaffController = {
  // --------------------------------CREATE ACCOUNT STAFF-------------------------------
  async createAccount(req, res, next) {
    try {
      const accounts = req.body; // Mảng các đối tượng

      const results = [];

      for (const account of accounts) {
        const {
          staff_id,
          password,
          role_id,
          specialty_id,
          first_name,
          last_name,
          citizen_id,
          gender,
          phone_number,
          email,
          address_contact,
          birthday,
        } = account;

        if (!password) {
          console.log(account);
          results.push({
            staff_id,
            status: false,
            message: "Password is required",
          });
        }

        let formattedBirthday =
          birthday !== undefined
            ? moment(birthday, "DD/MM/YYYY").format("YYYY-MM-DD")
            : null;

        const accountData = {
          staff_id: staff_id,
          password: password,
          role_id: role_id,
        };
        const staff_detailsData = {
          specialty_id: specialty_id,
          first_name: first_name,
          last_name: last_name,
          birthday: formattedBirthday,
          citizen_id: citizen_id,
          gender: gender,
          phone_number: phone_number,
          email: email,
          address_contact: address_contact,
        };

        const resultCreate_account = await accountStaffService.createAccount(
          accountData,
          staff_detailsData
        );

        results.push(resultCreate_account);
      }

      return res.status(200).json({
        message: "create accounts success",
        data: results,
      });
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------------LOGIN ADMIN SERVICE----------------------------------------------------------
  async checkAdminLogin(req, res, next) {
    try {
      const username = req.body?.username;
      const password = req.body?.password;

      if (!username) {
        return next(new ApiError(400, "Username is required"));
      }
      if (!password) {
        return next(new ApiError(400, "Password is required"));
      }
      const resultCheckLogin = await accountStaffService.checkAdminLogin(
        username,
        password
      );
      if (resultCheckLogin.success === true) {
        return res.status(200).json({
          message: "Admin login successful",
          accessToken: resultCheckLogin.accessToken,
          refreshToken: resultCheckLogin.refreshToken,
        });
      } else {
        return next(new ApiError(400, "Invalid username or password"));
      }
    } catch (error) {
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = accountStaffController;
