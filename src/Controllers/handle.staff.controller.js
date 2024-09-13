const ApiError = require("../api-error");
const handleStaffService = require("../Services/handle.staff.service");
const moment = require("moment");

const handleStaffController = {
  async getStaffList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, staffList, totalPages } =
        await handleStaffService.getStaffList(page);

      if (staffList === 0) {
        // res 204 No Content when list none
        return res.status(204).json({
          message: "No staff available",
          totalPages,
        });
      }

      res.status(200).json({ message, staffList, totalPages });
    } catch (error) {
      next(new ApiError(400, "Failed to get staff list!"));
    }
  },
};

module.exports = handleStaffController;
