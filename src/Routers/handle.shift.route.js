const express = require("express");
const router = express.Router();
const handleShiftController = require("../Controllers/handle.shift.controller");

//==================== GET ALL SHIFT OF CLINIC-=================
router.get("/getList", handleShiftController.getShiftList);
router.get(
  "/getListStaffWithShift/:shift_id",
  handleShiftController.getListStaffByShiftId
);
router.get("/:shift_id", handleShiftController.getShiftById);

// ==============CREATE A NEW SHIFT===============
router.post("/create", handleShiftController.createNewShift);

// ==============CREATE A NEW SHIFT===============
router.patch("/:shift_id", handleShiftController.updateShift);
module.exports = router;
