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

  //----------------------------GET LIST STAFF WORKED IN EACH SHIFTS BY SHIFT_ID-------------------------
  async getListStaffByShiftId(shift_id, page) {
    try {
      const itemsPerPage = 10;

      const offset = (page - 1) * itemsPerPage;

      const totalShitfStaff = await knex("STAFF_SHIFTS")
        .count("* as totalCount")
        .first();

      const totalShitfStaffCount = totalShitfStaff.totalCount;
      const totalPages = Math.ceil(totalShitfStaffCount / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No shifts available.`,
          totalPages,
          ShiftStaff: [],
        };
      }

      // get Staff list by shift_id and page
      const shiftStaffList = await knex("STAFF_SHIFTS as ss")
        .select(
          "ss.staff_id",
          "sd.first_name",
          "sd.last_name",
          "ss.shift_date as join_in",
          // fix khoảng trắng id
          knex.raw("TRIM(ss.shift_id) as shift_id"),
          "sh.shift_name",
          "sh.start_time",
          "sh.end_time",
          "dep.department_id",
          "dep.department_name",
          "ss.specialty_id",
          "spe.specialty_name",
          "ss.created_at",
          "ss.updated_at"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "ss.staff_id")
        .join("SHIFTS as sh", "sh.shift_id", "ss.shift_id")
        .join("DEPARTMENTS as dep", "dep.department_id", "ss.department_id")
        .join("SPECIALTIES as spe", "spe.specialty_id", "ss.specialty_id")
        .where("ss.shift_id", shift_id)
        .limit(itemsPerPage)
        .offset(offset);

      if (shiftStaffList.length === 0) {
        console.log({
          status: false,
          message: "staff list by shift_id is empty",
          totalPages,
          shiftStaffList,
          itemsPerPage,
        });
        return {
          status: false,
          message: "staff list by shift_id is empty",
          totalPages,
          shiftStaffList,
          itemsPerPage,
        };
      } else {
        console.log({
          status: true,
          message: "List staff by shift_id",
          totalPages,
          shiftStaffList,
          itemsPerPage,
        });
        return {
          status: true,
          message: "List staff by shift_id",
          totalPages,
          shiftStaffList,
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
