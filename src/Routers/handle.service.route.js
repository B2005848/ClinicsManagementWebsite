const express = require("express");
const router = express.Router();
const handleServiceController = require("../Controllers/handle.services.controller");

//============= CREATE
router.get("/create", handleServiceController.addService);

//============= GET INFORMATION DETAIL PATIENT BY PATIENT_ID
router.get(
  "/getService/:dep_id",
  handleServiceController.getServiceByDepartmentId
);

//============= lẤY DANH SÁCH DỊCH VỤ-
router.get("/getlistservices", handleServiceController.getServiceForAdmin);

// TÌM KIẾM DỊCH VỤ
router.get("/search", handleServiceController.searchServices);

module.exports = router;
