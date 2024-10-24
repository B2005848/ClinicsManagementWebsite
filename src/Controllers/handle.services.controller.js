const ApiError = require("../api-error");
const handleServicesManagementService = require("../Services/handle.services.service");

const handleServiceManagementController = {
  // ---------------GET INFORMATION OF PATIENT WITH PATIENT ID----------------
  async getServiceByDepartmentId(req, res, next) {
    try {
      const department_id = req.params.dep_id;
      const data =
        await handleServicesManagementService.getServiceByDepartmentId(
          department_id
        );
      if (data) {
        return res.status(200).json({
          status: 200,
          message: "get service success",
          dataInfo: data,
        });
      }
    } catch (error) {
      next(new ApiError(404, "service not exist!"));
    }
  },
};

module.exports = handleServiceManagementController;
