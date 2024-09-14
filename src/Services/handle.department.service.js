const { knex } = require("../../db.config");

const handleDepartment = {
  //----------------------------------------------GET LIST DEPARTMENTS--------------------------------
  async getDepartments(page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Get totals quantity departments
      const totalDepartments = await knex("DEPARTMENTS")
        .count("* as totalCount")
        .first();
      const totalItems = totalDepartments.totalCount;
      // Calculate quantity page
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No deparment available.`,
          totalPages,
          listDepartments: [],
        };
      }
      // Get departments
      const departments = await knex("DEPARTMENTS")
        .orderBy("department_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);

      if (departments) {
        return {
          status: true,
          message: "Departments retrieved successfully",
          totalPages,
          listDepartments: departments,
        };
      }
    } catch (error) {
      console.error("Error occured get departments:", error);
      throw error;
    }
  },

  //---------------------------------------------CREATE DEPARTMENT----------------------------------------------------
  async createDepartment(departmentData) {
    try {
      const { department_id, department_name } = departmentData;
      // Check if department already exists
      const existingDepartment = await knex("DEPARTMENTS")
        .where("department_id", department_id)
        .orWhere("department_name", department_name)
        .first();
      if (existingDepartment) {
        return {
          status: false,
          message: "Department already exists",
        };
      }
      // Insert new department
      const resultCreate = await knex("DEPARTMENTS").insert(departmentData);
      if (resultCreate) {
        return {
          status: true,
          message: "Department created successfully",
          departmentId: resultCreate[0],
          departmentData,
        };
      } else {
        return {
          status: false,
          message: "Failed to create department",
        };
      }
    } catch (error) {
      console.error("Error occured create department:", error);
      throw error;
    }
  },
};

module.exports = handleDepartment;
