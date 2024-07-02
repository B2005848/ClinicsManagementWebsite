const ApiError = require("../api-error");
const handlePatientService = require("../Services/handle.patient.service");

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

module.exports = {
  getDATA_patientBy_username,
};
