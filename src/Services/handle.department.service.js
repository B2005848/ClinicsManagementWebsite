const { knex } = require("../../db.config");

const handleDepartment = {
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
};

module.exports = handleDepartment;
