const ApiError = require("../api-error");
const handleServicesManagementService = require("../Services/handle.services.service");

const handleServiceManagementController = {
  // ---------------------- ADD NEW SERVICE ----------------------
  async addService(req, res, next) {
    try {
      const {
        service_id,
        service_name,
        service_fee,
        duration,
        description,
        department_id,
        specialty_id,
        is_active,
      } = req.body;

      // Kiểm tra các trường bắt buộc có trong body không
      if (
        !service_id ||
        !service_name ||
        !service_fee ||
        !duration ||
        !department_id ||
        !specialty_id
      ) {
        return next(new ApiError(400, "Missing required fields"));
      }

      // Gọi service để thêm dịch vụ mới
      const result = await handleServicesManagementService.addService({
        service_id,
        service_name,
        service_fee,
        duration,
        description,
        department_id,
        specialty_id,
        is_active,
      });

      if (result.status) {
        return res.status(201).json({
          message: result.message,
          service_id: result.service_id,
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error occurred while adding service:", error);
      next(new ApiError(500, "Failed to add service"));
    }
  },
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

  // Lấy thông tin chi tiết của dịch vụ
  async getDetailService(req, res, next) {
    try {
      const service_id = req.params.id;
      const data = await handleServicesManagementService.getServiceByServiceId(
        service_id
      );
      if (data) {
        return res.status(200).json({
          status: 200,
          message: data.message,
          dataInfo: data.data,
        });
      }
    } catch (error) {
      next(new ApiError(404, "service not exist!"));
    }
  },
  // Xóa dịch vụ
  async deleteServiceByServiceId(req, res, next) {
    try {
      const service_id = req.params.id;
      const data =
        await handleServicesManagementService.deleteServiceByServiceId(
          service_id
        );
      if (data.status === true) {
        return res.status(200).json({
          status: 200,
          message: data.message,
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

  // -------------------- MODIFY SERVICE --------------------
  async modifyService(req, res, next) {
    try {
      const serviceId = req.params.id;
      const {
        service_name,
        service_fee,
        duration,
        description,
        department_id,
        specialty_id,
        is_active,
      } = req.body;

      // Kiểm tra các trường cần thiết có trong body không
      if (
        !service_name &&
        !service_fee &&
        !duration &&
        !description &&
        !department_id &&
        !specialty_id
      ) {
        return next(new ApiError(400, "Missing fields to update"));
      }

      // Gọi service để cập nhật dịch vụ
      const result = await handleServicesManagementService.modifyService(
        serviceId,
        {
          service_name,
          service_fee,
          duration,
          description,
          department_id,
          specialty_id,
          is_active,
        }
      );

      if (result.status) {
        return res.status(200).json({
          message: result.message,
        });
      } else {
        return res.status(400).json({
          message: result.message,
          error: result.error,
        });
      }
    } catch (error) {
      console.error("Error occurred while modifying service:", error);
      next(new ApiError(500, "Failed to modify service"));
    }
  },
};

module.exports = handleServiceManagementController;
