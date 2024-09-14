const e = require("express");
const ApiError = require("../api-error");
const handlePatientService = require("../Services/handle.patient.service");
const moment = require("moment");

const handlePatientController = {
  // ------------------GET LIST ACCOUNT OF ALL PATIENTS---------------------
  async getListAccountPatients(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, patients, totalPages } =
        await handlePatientService.getListAccountPatients(page);
      res.status(200).json({ message, totalPages, patients });
    } catch (error) {
      next(new ApiError(400, "get all patient fail!"));
    }
  },

  // ---------------GET INFORMATION OF PATIENT WITH PATIENT ID----------------
  async getPatientByUsername(req, res, next) {
    try {
      const username = req.params.username;
      const data = await handlePatientService.getPatientByUsername(username);
      if (data) {
        return res.status(200).json({
          status: 200,
          message: "get data patient success",
          dataInfo: data,
        });
      }
    } catch (error) {
      next(new ApiError(404, "patient not exist!"));
    }
  },

  // ------------------------------------------------UPATE INFORMATION DETAIL CONTROLLER------------------------------
  async updateInformation(req, res, next) {
    try {
      const patient_id = req.params.id;
      const {
        first_name,
        last_name,
        birthday,
        citizen_id,
        gender,
        phone_number,
        major,
        email,
        address_contact,
        health_insurance_id,
      } = req.body;

      // format birthday
      const formattedBirthday = moment(birthday, "DD/MM/YYYY").format(
        "YYYY-MM-DD"
      );

      const data = {
        first_name,
        last_name,
        birthday: formattedBirthday,
        citizen_id,
        gender,
        phone_number,
        major,
        email,
        address_contact,
        health_insurance_id,
      };
      const resultUpdateInformation =
        await handlePatientService.updateInformation(patient_id, data);
      if (resultUpdateInformation) {
        console.log(`update information patient id: ${patient_id} success`);
        return res.status(200).json({
          message: "Update information successful",
          data: data,
        });
      } else {
        return next(new ApiError(400, "Update information failed"));
      }
    } catch (error) {
      return next(
        new ApiError(
          500,
          `An error occurred while update information with patient_id: ${patient_id}`
        )
      );
    }
  },
  // --------------------- SEARCH PATIENTS-------------------
  async searchPatients(req, res, next) {
    try {
      const query = req.query.q;
      const resultSearch = await handlePatientService.searchPatients(query);
      if (resultSearch.success === true) {
        return res.status(200).json({
          message: "Search patients successful",
          data: resultSearch.data,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Not found any patient with this information" });
      }
    } catch (error) {
      return next(
        new ApiError(500, "An error occurred while searching patients")
      );
    }
  },
};

module.exports = handlePatientController;
