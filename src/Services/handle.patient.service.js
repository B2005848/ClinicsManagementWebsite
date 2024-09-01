const { knex } = require("../../db.config");

// ------------------Get all list patient---------------------
async function getAllPatients(page) {
  try {
    const itemsPerPage = 10;
    const offset = (page - 1) * itemsPerPage;

    // Get quantity patients
    const totalPatients = await knex("patient_details")
      .count("* as totalCount")
      .first();
    const totalItems = totalPatients.totalCount;

    // Calculate quantity page
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    // get list patient by position page
    const patients = await knex("patient_details")
      .select(
        "patient_details.*",
        "patient_account.registration_date",
        "patient_account.statusAccount"
      )
      .join(
        "patient_account",
        "patient_account.username",
        "patient_details.username"
      )
      .limit(itemsPerPage)
      .offset(offset);
    if (patients) {
      return { patients, totalPages };
    }
  } catch (error) {
    console.error("Error retrieving patients:", error);
    throw error;
  }
}

// ---------------Get information patient data by username of them----------------
async function getDATA_patientBy_username(username) {
  try {
    const data = await knex("patient_details")
      .select(
        "patient_details.*",
        "patient_account.registration_date",
        "patient_account.statusAccount"
      )
      .join(
        "patient_account",
        "patient_account.username",
        "patient_details.username"
      )
      .where("patient_details.username", username)
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

// ------------------------Add a new patient-----------------------
async function addPatient(data) {
  try {
    const patient = await knex("patient_details").insert(data);

    if (patient) {
      return {
        status: true,
        message: "Patient Added Successfully",
        data: patient,
      };
    } else {
      return { status: false, message: "Error Occured" };
    }
  } catch (error) {
    return { status: false, message: "Error Occured", error: error.message };
  }
}

module.exports = {
  getDATA_patientBy_username,
  getAllPatients,
  addPatient,
};
