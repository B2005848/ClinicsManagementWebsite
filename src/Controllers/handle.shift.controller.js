const ApiError = require("../api-error");
const handleShiftService = require("../Services/handle.shift.service");

const handleShiftController = {
  // ----------------------------GET SHIFT BY ID------------------------------
  async getShiftById(req, res, next) {
    try {
      const { shift_id } = req.params; // Lấy shift_id từ URL params
      const result = await handleShiftService.getShiftById(shift_id); // Gọi service để lấy thông tin ca làm việc
      if (result.status) {
        return res.status(200).json({
          message: result.message,
          data: result.data, // Trả về thông tin ca làm việc
        });
      } else {
        return next(new ApiError(404, result.message)); // Nếu không tìm thấy ca làm việc
      }
    } catch (error) {
      console.error("Error in getShiftById:", error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------------------CREATE NEW SHIFT------------------------------
  async createNewShift(req, res, next) {
    try {
      const { shift_id, shift_name, start_time, end_time } = req.body; // Lấy dữ liệu từ body
      const newShiftData = { shift_id, shift_name, start_time, end_time };

      // Gọi service để tạo ca làm việc mới
      const result = await handleShiftService.createShift(newShiftData);

      if (result.status) {
        res.status(200).json({
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error(error);
      next(new ApiError(500, "Failed to create new shift"));
    }
  },

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
      console.log(error);
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

  // ----------------------------UPDATE SHIFT------------------------------
  async updateShift(req, res, next) {
    try {
      const { shift_id } = req.params; // Lấy shift_id từ tham số URL
      const updatedShiftData = req.body; // Lấy dữ liệu cập nhật từ body

      // Gọi service để cập nhật ca làm việc
      const result = await handleShiftService.updateShift(
        shift_id,
        updatedShiftData
      );

      if (result.status) {
        res.status(200).json({
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      next(new ApiError(500, "Failed to update shift"));
    }
  },
};

module.exports = handleShiftController;
