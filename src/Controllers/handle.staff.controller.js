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

  // ---------------------------SELECT DOCTOR BY SPECIALTY---------------
  async selectDoctorBySpecialtyId(req, res, next) {
    try {
      const specialty_id = req.params.id;
      const result = await handleStaffService.selectDoctorBySpecialtyId(
        specialty_id
      );
      if (result.success === true) {
        return res.status(200).json({
          message: result.message,
          dataInfo: result.data,
        });
      } else {
        return next(new ApiError(404, "Doctor not found"));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ----------------SELECT SHIFT OF DOCTOR BY DEPARTMENT_ID, SPECIALTY_ID AND DOCTOR_ID----------------
  async getDoctorShifts(req, res, next) {
    try {
      const { department_id, specialty_id, doctor_id } = req.params;

      const result = await handleStaffService.getDoctorShifts(
        department_id,
        specialty_id,
        doctor_id
      );

      if (result.success === true) {
        return res.status(200).json({
          message: result.message,
          shifts: result.data,
        });
      } else {
        return next(
          new ApiError(404, "Shifts not found for the specified doctor")
        );
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ------------------------- LẤY THÔNG TIN CA LÀM VIỆC CỦA NHÂN VIÊN ------------------------
  async getInformationShift(req, res, next) {
    try {
      const staffId = req.params.id; // Lấy staffId từ params
      const result = await handleStaffService.getInformationShift(staffId); // Gọi service lấy thông tin ca làm việc

      if (result.status === true) {
        return res.status(200).json({
          message: result.message,
          shiftStaffList: result.shiftStaffList,
        });
      } else {
        return next(new ApiError(404, result.message)); // Nếu không có ca làm việc
      }
    } catch (error) {
      console.error("Lỗi khi lấy thông tin ca làm việc cho nhân viên:", error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ---------------------------THÊM CHUYÊN KHOA CHO NHÂN VIÊN---------------------------
  async addSpecialtiesForStaff(req, res, next) {
    try {
      const staffId = req.params.id;
      const { specialtyIds } = req.body;

      const result = await handleStaffService.addSpecialtiesForStaff(
        staffId,
        specialtyIds
      );

      if (result.success === true) {
        return res.status(200).json({
          message: result.message,
        });
      } else {
        return next(new ApiError(400, result.message));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  // ---------------------------THÊM CA LÀM VIỆC CHO NHÂN VIÊN---------------------------
  async addShiftsForStaff(req, res, next) {
    try {
      const staffId = req.params.id; // Lấy staffId từ params
      const { shifts } = req.body; // Lấy danh sách ca làm việc từ body

      // Kiểm tra xem shifts có phải là mảng hay không
      if (!Array.isArray(shifts) || shifts.length === 0) {
        return next(
          new ApiError(400, "Shifts phải là một mảng và không được rỗng.")
        );
      }

      // Gọi service để thêm các ca làm việc cho nhân viên
      const result = await handleStaffService.addShiftsForStaff(
        staffId,
        shifts
      );

      if (result.success === true) {
        return res.status(200).json({
          message: result.message,
        });
      } else {
        return next(new ApiError(400, result.message));
      }
    } catch (error) {
      console.log("Lỗi khi thêm ca làm việc cho nhân viên:", error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },
};

module.exports = handleStaffController;
