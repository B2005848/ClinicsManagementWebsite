const ApiError = require("../api-error");
const handleStaffService = require("../Services/handle.staff.service");
const moment = require("moment");

const handleStaffController = {
  // --------------------------------CREATE ACCOUNT STAFF-------------------------------
  async createAccount(req, res, next) {
    try {
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
      } = req.body;

      let birthday =
        req.body?.birthday !== undefined ? req.body?.birthday : null;
      if (birthday) {
        birthday = moment(birthday, "DD/MM/YYYY").format("YYYY-MM-DD");
      }
      const accountData = {
        staff_id: staff_id,
        password: password,
        role_id: role_id,
      };
      const staff_detailsData = {
        specialty_id: specialty_id,
        first_name: first_name,
        last_name: last_name,
        birthday: birthday,
        citizen_id: citizen_id,
        gender: gender,
        phone_number: phone_number,
        email: email,
        address_contact: address_contact,
      };

      const resultCreate_account = await handleStaffService.createAccount(
        accountData,
        staff_detailsData
      );
      if (resultCreate_account.status === true) {
        return res.status(200).json({
          message: resultCreate_account.message,
          data: resultCreate_account.data,
        });
      } else {
        return next(new ApiError(400, "Account already exits"));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------GET ACCOUNT ALL STAFF------------------------------
  async getStaffList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, staffList, totalPages } =
        await handleStaffService.getStaffAccountList(page);

      if (staffList === 0) {
        // res 204 No Content when list none
        return res.status(204).json({
          message: "No staff available",
          totalPages,
        });
      }

      res.status(200).json({ message, staffList, totalPages });
    } catch (error) {
      next(new ApiError(400, "Failed to get account staff list!"));
    }
  },
};

module.exports = handleStaffController;
