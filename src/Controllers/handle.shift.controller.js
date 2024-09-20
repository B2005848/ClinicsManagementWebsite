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
};

module.exports = handleShiftController;
