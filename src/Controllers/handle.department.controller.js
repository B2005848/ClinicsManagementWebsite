const ApiError = require("../api-error");
const handleDepartmentService = require("../Services/handle.department.service");
const handleDepartmentController = {
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
};

module.exports = handleDepartmentController;
