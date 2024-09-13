const { knex } = require("../../db.config");

const handleStaffService = {
  async getStaffList(page) {
    try {
      const itemsPerPage = 10;
      // skip offset first in table
      const offset = (page - 1) * itemsPerPage;

      // Get quantity staff
      const totalStaffs = await knex("STAFF_ACCOUNTS")
        .count("* as totalCount")
        .first();
      // Get value quantity staff
      const totalStaffsCount = totalStaffs.totalCount;
      // Calculate quantity page
      const totalPages = Math.ceil(totalStaffsCount / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No staff available.`,
          totalPages,
          staffList: [],
        };
      }
      // Get staff list by position page
      const staffList = await knex("STAFF_ACCOUNTS")
        .limit(itemsPerPage)
        .offset(offset);
      if (
        // Check if staff list is empty
        staffList.length === 0
      ) {
        console.log(
          "Staff list is empty. Please check your database or contact admin."
        );
        return {
          status: false,
          message: "Staff list is empty",
          totalPages,
          staffList,
        };
      } else {
        console.log(
          `Get staff list success . Total staffs: ${totalStaffsCount}`
        );
        return {
          status: true,
          message: "Staff list",
          totalPages,
          staffList,
        };
      }
    } catch (error) {
      console.error("Error during get list staff account :", error);
      throw error;
    }
  },
};

module.exports = handleStaffService;
