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
};

module.exports = handleDepartmentController;
