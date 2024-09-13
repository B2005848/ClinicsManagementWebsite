const { knex } = require("../../db.config");

const handlePatientService = {
  // ------------------GET LIST ACCOUNT OF ALL PATIENTS---------------------
  async getListAccountPatients(page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Get quantity patients
      const totalPatients = await knex("PATIENT_ACCOUNTS")
        .count("* as totalCount")
        .first();
      const totalItems = totalPatients.totalCount;

      // Calculate quantity page
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No patient available.`,
          totalPages,
          patients: [],
        };
      }
      // get list patient by position page
      const patients = await knex("PATIENT_ACCOUNTS")
        .limit(itemsPerPage)
        .offset(offset);
      if (patients) {
        return {
          status: true,
          message: "Get list patient successfully",
          patients,
          totalPages,
        };
      }
    } catch (error) {
      console.error("Error retrieving patients:", error);
      throw error;
    }
  },

  // ---------------GET INFORMATION OF PATIENT WITH PATIENT ID----------------
  async getPatientByUsername(patient_id) {
    try {
      const data = await knex("PATIENT_DETAILS")
        .where("patient_id", patient_id)
        .first();
      if (data) {
        return data;
      } else {
        return {
          status: false,
          message: "Patient Details Not Found",
        };
      }
    } catch (error) {
      return {
        status: false,
        message: "Error Occured get data of patient",
        error: error.message,
      };
    }
  },

  // -----------UPDATE INFORMATION DETAIL-------------------------------------
  async updateInformation(patient_id, data) {
    try {
      const patientIdExiting = await knex("PATIENT_DETAILS")
        .where("patient_id", patient_id)
        .first();
      if (patientIdExiting) {
        const updatedPatient = await knex("PATIENT_DETAILS")
          .where("patient_id", patient_id)
          .update(data);
        if (updatedPatient) {
          return {
            success: true,
            message: "Account information updated successfully",
          };
        } else {
          return {
            success: false,
            message: "Failed to update account information",
          };
        }
      } else {
        return { success: false, message: "Patient ID not found" };
      }
    } catch (error) {
      console.error("Error during update account info:", error);
      throw error;
    }
  },
};

module.exports = handlePatientService;
