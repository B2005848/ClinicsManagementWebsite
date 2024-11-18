const ApiError = require("../api-error");
const handleServicesManagementService = require("../Services/handle.services.service");

const handleServiceManagementController = {
  //-----------------------GET SERVICE BY DEPARTMENT_ID-----------------------
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

  //-------------------------------- LẤY DANH SÁCH DỊCH VỤ -----------------------------------
  async getServiceForAdmin(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, totalPages, itemsPerPage, listServices, status } =
        await handleServicesManagementService.getServiceForAdmin(page);

      if (status === false || listServices.length === 0) {
        // Trả về 404 khi không có dịch vụ hoặc danh sách trống
        return res.status(404).json({
          message: "No services available",
          totalPages,
          listServices: [],
        });
      } else {
        console.log({ message, totalPages, listServices });
        return res.status(200).json({
          page,
          message,
          totalPages,
          itemsPerPage,
          listServices,
        });
      }
    } catch (error) {
      // Xử lý lỗi khi có sự cố phía server (ví dụ: lỗi cơ sở dữ liệu)
      console.error("Error occurred while fetching services:", error);
      next(
        new ApiError(
          500,
          "Failed to retrieve list of services due to server error"
        )
      );
    }
  },

  // --------------------- SEARCH SERVICES-------------------
  async searchServices(req, res, next) {
    try {
      const query = req.query.search;
      const resultSearch = await handleServicesManagementService.searchServices(
        query
      );
      if (resultSearch.success === true) {
        return res.status(200).json({
          message: "Search services successful",
          data: resultSearch.data,
        });
      } else {
        return res
          .status(404)
          .json({ message: "Not found any service with this information" });
      }
    } catch (error) {
      return next(
        new ApiError(500, "An error occurred while searching service")
      );
    }
  },
};

module.exports = handleServiceManagementController;
