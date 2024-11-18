const { knex } = require("../../db.config");

const handleServiceManagement = {
  //-----------------------GET SERVICE BY DEPARTMENT_ID-----------------------
  async getServiceByDepartmentId(department_id) {
    try {
      const data = await knex("SERVICES")
        .where("department_id", department_id)
        .andWhere("is_active", 1);
      if (data) {
        return data;
      } else {
        return {
          status: false,
          message: "Service Not Found",
        };
      }
    } catch (error) {
      return {
        status: false,
        message: "Error Occured get this service",
        error: error.message,
      };
    }
  },

  // lẤY DANH SÁCH DỊCH VỤ
  async getServiceForAdmin(page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Get total quantity of services
      const totalServices = await knex("SERVICES")
        .count("* as totalCount")
        .first();
      const totalItems = totalServices.totalCount;
      const totalPages = Math.ceil(totalItems / itemsPerPage);

      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No services available.`,
          totalPages,
          listServices: [],
        };
      }

      // Get services with departments and specialties
      const services = await knex("SERVICES as se")
        .select("se.*", "dep.department_name", "spe.specialty_name")
        .join("DEPARTMENTS as dep", "dep.department_id", "se.department_id")
        .join("SPECIALTIES as spe", "spe.specialty_id", "se.specialty_id")
        .orderBy("se.service_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);

      // Log for debugging (only for development)
      console.log(services);

      if (services.length > 0) {
        return {
          status: true,
          message: "Service retrieved successfully",
          totalPages,
          itemsPerPage,
          listServices: services,
        };
      } else {
        return {
          status: false,
          message: "No services found",
          totalPages,
          listServices: [],
        };
      }
    } catch (error) {
      console.error("Error occurred while fetching services:", error);
      throw error;
    }
  },

  // TÌm kiếm dịch vụ
  async searchServices(query) {
    try {
      const services = await knex("SERVICES as se")
        .select("se.*", "dep.department_name", "spe.specialty_name")
        .join("DEPARTMENTS as dep", "dep.department_id", "se.department_id")
        .join("SPECIALTIES as spe", "spe.specialty_id", "se.specialty_id")
        .where(function () {
          this.where("dep.department_id", "like", `%${query}%`)
            .orWhere("dep.department_name", "like", `%${query}%`)
            .orWhere("se.specialty_id", "like", `%${query}%`)
            .orWhere("se.service_name", "like", `%${query}%`)
            .orWhere("se.service_name", "like", `%${query}%`)
            .orWhere("se.service_id", "like", `%${query}%`);
        })
        .orderBy("se.service_id", "asc");
      if (services.length > 0) {
        console.log("Search service success");
        return {
          success: true,
          message: "List Services",
          data: services,
        };
      } else {
        console.log("services not found");
        return {
          success: false,
          message: "services not found",
        };
      }
    } catch (error) {
      console.error("Error during search services:", error);
      return {
        status: false,
        message: "Error during search services",
        error: error.message,
      };
    }
  },
};

module.exports = handleServiceManagement;
