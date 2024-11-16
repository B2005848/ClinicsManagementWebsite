const ApiError = require("../api-error");
const handleDepartmentService = require("../Services/handle.department.service");
const handleDepartmentController = {
  //------------------------------------------------------GET LIST DEPARTMENTS FOR PATIENT--------------------------------
  async getDepartmentsForPatient(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, totalPages, itemsPerPage, listDepartments } =
        await handleDepartmentService.getDepartmentsForPatient(page);
      res.json({ page, message, totalPages, itemsPerPage, listDepartments });
      console.log({ message, totalPages, listDepartments });
    } catch (error) {
      next(new ApiError(400, "get all patient fail!"));
    }
  },

  //------------------------------------------------------GET LIST DEPARTMENTS FOR ADMIN--------------------------------
  async getDepartmentsForAdmin(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, totalPages, itemsPerPage, listDepartments } =
        await handleDepartmentService.getDepartmentsForAdmin(page);
      res.json({ page, message, totalPages, itemsPerPage, listDepartments });
      console.log({ message, totalPages, listDepartments });
    } catch (error) {
      next(new ApiError(400, "get all patient fail!"));
    }
  },

  //---------------------------------------------CREATE DEPARTMENT----------------------------------------------------
  async createDepartment(req, res, next) {
    try {
      const { department_id, department_name, description } = req.body;

      const deparmentData = {
        department_id: department_id,
        department_name: department_name,
        description: description,
      };
      const data = await handleDepartmentService.createDepartment(
        deparmentData
      );
      if (data.status === true) {
        res.status(200).json({
          message: data.message,
          departmentData: data.departmentData,
        });
      } else {
        res.status(404).json({ message: data.message });
      }
    } catch (error) {
      next(new ApiError(400, "get all patient fail!"));
    }
  },

  //------------------------------------- DELETE A DEPARTMENT------------------------------------
  async deleteDepartment(req, res, next) {
    try {
      const department_id = req.params.id;
      const data = await handleDepartmentService.deleteDepartment(
        department_id
      );
      if (data.status === true) {
        res.json({ message: data.message });
      } else {
        res.json({ message: data.message });
      }
    } catch (error) {
      next(new ApiError(400, "get all patient fail!"));
    }
  },

  //-------------------------------- MODIFY INFORMATION DEPARTMENT---------------------------------------
  async modifyDepartment(req, res, next) {
    try {
      const department_id = req.params.id;
      const deparmentData = { ...req.body };

      if (Object.keys(deparmentData).length === 0) {
        return next(new ApiError(400, "No information to update"));
      }

      const resultModify = await handleDepartmentService.modifyDepartment(
        department_id,
        deparmentData
      );
      if (resultModify.status === true) {
        res.json({
          message: resultModify.message,
          departmentData: resultModify.departmentData,
        });
      } else {
        res.json({ message: resultModify.message });
      }
    } catch (error) {
      next(
        new ApiError(
          500,
          `An error occured modify information with ${department_id}`
        )
      );
    }
  },

  //------------------- SEARCH DEPARTMENTS --------------------
  async searchDepartments(req, res, next) {
    try {
      const query = req.query.search;
      const result = await handleDepartmentService.searchDepartments(query);
      if (result.success === true) {
        return res
          .status(200)
          .json({ message: result.message, data: result.data });
      } else {
        return next(new ApiError(404, "Departments not found"));
      }
    } catch (error) {
      console.log(error);
      return next(new ApiError(500, "Internal Server Error"));
    }
  },

  //------------------- GET DEPARTMENTS BY SPECIALTY --------------------
  async getDepartmentsBySpecialty(req, res, next) {
    try {
      const specialtyId = req.params.specialtyId;
      const result = await handleDepartmentService.getDepartmentsBySpecialty(
        specialtyId
      );
      if (result.status === true) {
        res.json({
          message: result.message,
          data: result.data,
        });
      } else {
        res.status(404).json({ message: result.message });
      }
    } catch (error) {
      next(new ApiError(500, "Failed to retrieve departments by specialty."));
    }
  },

  //------------------------------------------------------CHECK IF DEPARTMENT NAME EXISTS--------------------------------
  async checkDepartmentNameExists(req, res, next) {
    try {
      const { department_name } = req.body;

      // Kiểm tra xem tên phòng ban đã tồn tại trong cơ sở dữ liệu chưa
      const departmentExists =
        await handleDepartmentService.checkDepartmentNameExists(
          department_name
        );

      if (departmentExists.status === true) {
        return res.status(400).json({
          message: `Tên phòng ban "${department_name}" đã tồn tại, vui lòng chọn tên khác.`,
        });
      } else {
        return res.status(200).json({
          message: `Tên phòng ban "${department_name}" có thể sử dụng.`,
        });
      }
    } catch (error) {
      next(new ApiError(500, "Kiểm tra tên phòng ban thất bại"));
    }
  },

  //------------------------------------------------------CHECK IF DEPARTMENT ID EXISTS--------------------------------
  async checkDepartmentIdExists(req, res, next) {
    try {
      const { department_id } = req.body;

      // Kiểm tra xem ID phòng ban đã tồn tại trong cơ sở dữ liệu chưa
      const departmentExists =
        await handleDepartmentService.checkDepartmentIdExists(department_id);

      if (departmentExists.status === true) {
        return res.status(400).json({
          message: `ID phòng ban "${department_id}" đã tồn tại, vui lòng chọn ID khác.`,
        });
      } else {
        return res.status(200).json({
          message: `ID phòng ban "${department_id}" có thể sử dụng.`,
        });
      }
    } catch (error) {
      next(new ApiError(500, "Kiểm tra tên phòng ban thất bại"));
    }
  },

  // Lấy thông tin chi tiết phòng khám
  async getDepartmentDetail(req, res, next) {
    try {
      const department_id = req.params.id;

      // Kiểm tra xem ID phòng ban đã tồn tại trong cơ sở dữ liệu chưa
      const result = await handleDepartmentService.getDepartmentDetail(
        department_id
      );

      if (result.status === true) {
        return res.status(200).json({
          message: result.message,
          data: result.data,
        });
      } else {
        return res.status(400).json({
          message: result.message,
        });
      }
    } catch (error) {
      next(new ApiError(500, "Lấy dữ liệu chi tiết của phòng thất bại"));
    }
  },

  //lấy danh sách nhân viên theo department_id
  async getListStaffByDep(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const department_id = req.params.department_id;
      const { message, totalPages, listStaffByDep, itemsPerPage } =
        await handleDepartmentService.getListStaffByDepId(department_id, page);
      if (listStaffByDep === 0) {
        return res.status(204).json({
          message: `No staff join in this department: ${department_id}`,
          totalPages,
        });
      }
      res
        .status(200)
        .json({ message, totalPages, listStaffByDep, itemsPerPage });
    } catch (error) {
      console.log(error);
      return next(
        new ApiError(400, "Failed to get list staff by department ID!")
      );
    }
  },
};

module.exports = handleDepartmentController;
