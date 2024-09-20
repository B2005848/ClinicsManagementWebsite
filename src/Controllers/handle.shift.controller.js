const ApiError = require("../api-error");
const handleShiftService = require("../Services/handle.shift.service");

const handleShiftController = {
  // ----------------------------GET DATA SHIFT------------------------------

  async getShiftList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, shiftList, totalPages, itemsPerPage } =
        await handleShiftService.getShiftList(page);

      if (shiftList === 0) {
        // res 204 No Content when list none
        return res.status(204).json({
          message: "No shift available",
          totalPages,
        });
      }

      res.status(200).json({ message, shiftList, totalPages, itemsPerPage });
    } catch (error) {
      next(new ApiError(400, "Failed to get list shifts!"));
    }
  },

  // --------------------------- GET LIST STAFF BY SHIFT_ID------------------------
  async getListStaffByShiftId(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const shift_id = req.params.shift_id;
      const { message, totalPages, shiftStaffList, itemsPerPage } =
        await handleShiftService.getListStaffByShiftId(shift_id, page);
      if (shiftStaffList === 0) {
        return res.status(204).json({
          message: `No staff join in this shift: ${shift_id}`,
          totalPages,
        });
      }
      res
        .status(200)
        .json({ message, totalPages, shiftStaffList, itemsPerPage });
    } catch (error) {
      next(new ApiError(400, "Failed to get list staff by shift_id!"));
    }
  },
};

module.exports = handleShiftController;
