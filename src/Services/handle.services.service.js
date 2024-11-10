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
};

module.exports = handleServiceManagement;
