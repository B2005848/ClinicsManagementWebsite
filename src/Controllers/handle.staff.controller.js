const ApiError = require("../api-error");
const handleStaffService = require("../Services/handle.staff.service");

const handleStaffController = {
  // ----------------------------GET ACCOUNT ALL STAFF------------------------------
  async getStaffList(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, staffList, totalPages, itemsPerPage } =
        await handleStaffService.getStaffAccountList(page);

      if (staffList === 0) {
        // res 204 No Content when list none
        return res.status(204).json({
          message: "No staff available",
          totalPages,
        });
      }

      res.status(200).json({ message, staffList, totalPages, itemsPerPage });
    } catch (error) {
      next(new ApiError(400, "Failed to get account staff list!"));
    }
  },
  //------------------------------GET INFORMATION DETAILS STAFF BY STAFF_ID------------------------------
  async getStaffInfoById(req, res, next) {
    try {
      const staff_id = req.params.id;
      const result = await handleStaffService.getStaffInfoById(staff_id);
      if (result.status === true) {
        return res.status(200).json({
          message: result.message,
          data: result.data,
          specialty: result.specialty,
        });
      } else {
        return next(new ApiError(404, "Staff not found"));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  //------------------- SEARCH STAFF --------------------
  async searchStaffs(req, res, next) {
    try {
      const query = req.query.search;
      const result = await handleStaffService.searchStaffs(query);
      if (result.success === true) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      } else {
        return next(new ApiError(404, "Staff not found"));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = handleStaffController;
