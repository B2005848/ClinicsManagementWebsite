const ApiError = require("../api-error");
const handlePatientService = require("../Services/handle.patient.service");

// ------------------Get all list patient---------------------
async function getALL_patients(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const { patients, totalPages } = await handlePatientService.getALL_patients(
      page
    );
    res.status(200).json({ patients, totalPages });
  } catch (error) {
    next(new ApiError(400, "get all patient fail!"));
  }
}

// ---------------Get information patient data by username of them----------------
async function getDATA_patientBy_username(req, res, next) {
  try {
    const username = req.params.username;
    const data = await handlePatientService.getDATA_patientBy_username(
      username
    );
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
}

// ----------------------Add a new patient-----------------
// ----------------------Add a new patient-----------------
async function addNew_patient(req, res, next) {
  try {
    // Destructure and validate required fields
    const {
      username,
      name,
      birth_year,
      gender,
      contact_addrees,
      phone_number,
      email,
    } = req.body;

    if (
      !username ||
      !name ||
      !birth_year ||
      !gender ||
      !contact_addrees ||
      !phone_number ||
      !email
    ) {
      return res.status(400).json({
        status: 400,
        message: "Missing required fields",
      });
    }

    const dataInfo = {
      username,
      name,
      birth_year,
      gender,
      contact_addrees,
      phone_number,
      email,
    };

    const data = await handlePatientService.addPatient(dataInfo);

    if (data) {
      return res.status(200).json({
        status: 200,
        message: "Add new patient success",
        dataInfo: data,
      });
    } else {
      return res.status(400).json({
        status: 400,
        message: "Add new patient fail",
      });
    }
  } catch (error) {
    console.error("Error adding new patient:", error);
    next(new ApiError(500, "An error occurred while adding new patient"));
  }
}

module.exports = {
  getDATA_patientBy_username,
  getALL_patients,
  addNew_patient,
};
