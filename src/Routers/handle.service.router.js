const express = require("express");
const router = express.Router();
const handleServiceController = require("../Controllers/handle.services.controller");

//============= GET INFORMATION DETAIL PATIENT BY PATIENT_ID
router.get(
  "/getService/:dep_id",
  handleServiceController.getServiceByDepartmentId
);

module.exports = router;
