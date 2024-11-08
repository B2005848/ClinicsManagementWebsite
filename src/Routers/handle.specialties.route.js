const express = require("express");
const router = express.Router();
const handleSpecialtiesController = require("../Controllers/handle.specialties.controller");

//====== GET LIST SPECIALTIES
router.get("/", handleSpecialtiesController.getSpecialties);

//====== GET ALL SPECIALTIES WITHOUT PAGINATION
router.get("/all", handleSpecialtiesController.getAllSpecialties);
module.exports = router;
