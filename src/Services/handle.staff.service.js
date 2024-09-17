const { knex } = require("../../db.config");
require("dotenv").config();
const handleStaffService = {
  // ----------------------------GET ACCOUNT ALL STAFF------------------------------
  async getStaffAccountList(page) {
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
      const staffList = await knex("STAFF_ACCOUNTS as sa")
        .select(
          "sa.staff_id",
          "sa.status",
          "sa.role_id",
          "sd.first_name",
          "sd.last_name",
          "sd.email",
          "sd.citizen_id",
          "sa.created_at",
          "sa.updated_at"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .orderBy("sa.staff_id", "asc")
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
          message: "Account staff list",
          totalPages,
          staffList,
        };
      }
    } catch (error) {
      console.error("Error during get account list staff account :", error);
      throw error;
    }
  },

  //------------------------------GET INFORMATION DETAILS STAFF BY STAFF_ID------------------------------
  async getStaffInfoById(staffId) {
    try {
      // Get staff info by staff id
      const staffInfo = await knex("STAFF_ACCOUNTS as sa")
        .select("sd.*", "sa.role_id as role", "sa.status as statusAccount")
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .where("sa.staff_id", staffId)
        .first();
      if (!staffInfo) {
        console.log("Staff not found");
        return {
          status: false,
          message: "Staff not found",
        };
      } else {
        console.log("Get staff info by staff id success");
        return {
          status: true,
          message: "Staff info",
          data: [staffInfo],
        };
      }
    } catch (error) {
      console.error("Error during get account list staff account :", error);
      throw error;
    }
  },

  //------------------- SEARCH STAFF --------------------
  async searchStaffs(query) {
    try {
      // Search staff by name, email, staff id
      const staffList = await knex("STAFF_ACCOUNTS as sa")
        .select(
          "sa.*",
          "sd.first_name as first_name",
          "sd.last_name as last_name",
          "sd.citizen_id",
          "sd.email as email"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .where("sa.staff_id", "like", `%${query}%`)
        .orWhere("sd.first_name", "like", `%${query}%`)
        .orWhere("sd.last_name", "like", `%${query}%`)
        .orWhere("sd.citizen_id", "like", `%${query}%`)
        .orWhere("sd.email", "like", `%${query}%`)
        .orderBy("sd.staff_id", "asc");
      if (staffList.length > 0) {
        console.log("Search staff success");
        return {
          success: true,
          message: "Staff list",
          data: staffList,
        };
      } else {
        console.log("Search staff not found");
        return {
          success: false,
          message: "Staff not found",
        };
      }
    } catch (error) {
      console.error("Error during search staffs :", error);
      return {
        status: false,
        message: "Error during search staffs",
        error: error.message,
      };
    }
  },
};

module.exports = handleStaffService;
