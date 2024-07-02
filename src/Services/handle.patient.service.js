const { knex } = require("../../db.config");

async function getDATA_patientBy_username(username) {
  try {
    const data = await knex("patient_details")
      .where("username", username)
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
}

module.exports = {
  getDATA_patientBy_username,
};
