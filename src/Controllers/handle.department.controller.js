const ApiError = require("../api-error");
const handleDepartmentService = require("../Services/handle.department.service");
const handleDepartmentController = {
  //------------------------------------------------------GET LIST DEPARTMENTS--------------------------------
  async getDepartments(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, totalPages, listDepartments } =
        await handleDepartmentService.getDepartments(page);
      res.json({ page, message, totalPages, listDepartments });
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
        res.json({
          message: data.message,
          departmentData: data.departmentData,
        });
      } else {
        res.json({ message: data.message });
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
      const { department_name, description } = req.body;
      const deparmentData = {
        department_name: department_name,
        description: description,
      };
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
};

module.exports = handleDepartmentController;
