const { knex } = require("../../db.config");
require("dotenv").config();
const handleShiftService = {
  // ----------------------------GET DATA SHIFT------------------------------
  async getShiftList(page) {
    try {
      const itemsPerPage = 10;
      // skip offset first in table
      const offset = (page - 1) * itemsPerPage;

      // Get quantity shift
      const totalShifts = await knex("SHIFTS").count("* as totalCount").first();
      // Get value quantity shift
      const totalShiftsCount = totalShifts.totalCount;
      // Calculate quantity page
      const totalPages = Math.ceil(totalShiftsCount / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No shifts available.`,
          totalPages,
          shiftList: [],
        };
      }
      // Get shift list by position page
      const shiftList = await knex("SHIFTS as sh")
        .select("sh.*")
        .orderBy("sh.shift_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);
      if (
        // Check if staff list is empty
        shiftList.length === 0
      ) {
        console.log(
          "Staff list is empty. Please check your database or contact admin."
        );
        return {
          status: false,
          message: "Staff list is empty",
          totalPages,
          shiftList,
          itemsPerPage,
        };
      } else {
        console.log(
          `Get staff list success . Total staffs: ${totalShiftsCount}`
        );
        console.log("Response from getShiftList:", {
          shiftList,
          totalPages,
          itemsPerPage,
        });
        return {
          status: true,
          message: "List shift get success",
          totalPages,
          shiftList,
          itemsPerPage,
        };
      }
    } catch (error) {
      console.error("Error during get list shifts :", error);
      throw error;
    }
  },
};

module.exports = handleShiftService;
