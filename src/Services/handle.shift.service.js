const { knex } = require("../../db.config");
require("dotenv").config();
const handleShiftService = {
  // ----------------------------GET SHIFT BY ID------------------------------
  async getShiftById(shift_id) {
    try {
      // Truy vấn bảng SHIFTS để lấy thông tin ca làm việc theo shift_id
      const shift = await knex("SHIFTS")
        .select(
          knex.raw("TRIM(shift_id) as shift_id"),
          "shift_name",
          "start_time",
          "end_time",
          "created_at",
          "updated_at"
        )
        .where("shift_id", shift_id)
        .first(); // Dùng first() để chỉ lấy một bản ghi

      if (!shift) {
        return {
          status: false,
          message: "Shift not found",
        };
      }

      console.log("Shift found:", shift);
      return {
        status: true,
        message: "Shift found",
        data: shift,
      };
    } catch (error) {
      console.error("Error during fetching shift data:", error);
      return {
        status: false,
        message: "Error during fetching shift data",
        error: error.message,
      };
    }
  },

  // ----------------------------CREATE NEW SHIFT------------------------------
  async createShift(newShiftData) {
    try {
      // Insert new shift data into SHIFTS table
      const [newShift] = await knex("SHIFTS")
        .insert({
          shift_id: newShiftData.shift_id,
          shift_name: newShiftData.shift_name,
          start_time: newShiftData.start_time,
          end_time: newShiftData.end_time,
        })
        .returning("*"); // Use returning to get the newly inserted row

      console.log("New shift created successfully:", newShift);
      return {
        status: true,
        message: "New shift created successfully",
        data: newShift,
      };
    } catch (error) {
      console.error("Error during creating new shift:", error);
      return {
        status: false,
        message: "Error during creating new shift",
        error: error.message,
      };
    }
  },

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
        .select(
          knex.raw("TRIM(sh.shift_id) as shift_id"),
          "sh.shift_name",
          "sh.start_time",
          "sh.end_time",
          "sh.created_at",
          "sh.updated_at"
        )
        .orderBy("sh.shift_id", "desc")
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
        .where("STAFF_SHIFTS.shift_id", shift_id)
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
          "rol.role_name",
          "ss.shift_date as join_in",
          // fix khoảng trắng id
          knex.raw("TRIM(ss.shift_id) as shift_id"),
          "sh.shift_name",
          "sh.start_time",
          "sh.end_time",
          "dep.department_id",
          "dep.department_name",
          "spe.specialty_id",
          "spe.specialty_name",
          "ss.created_at",
          "ss.updated_at"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "ss.staff_id")
        .join("SHIFTS as sh", "sh.shift_id", "ss.shift_id")
        .join("DEPARTMENTS as dep", "dep.department_id", "ss.department_id")
        .join("SPECIALTIES as spe", "spe.specialty_id", "ss.specialty_id")
        .join("STAFF_ACCOUNTS as sc", "sc.staff_id", "ss.staff_id")
        .join("ROLES as rol", "rol.role_id", "sc.role_id")
        .where("ss.shift_id", shift_id)
        .orderBy("ss.shift_date", "asc")
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
      console.error("Error during get list shifts :", error.message);
      console.log("Shift ID:", shift_id);
      console.log("Offset:", offset);
      console.log("Items per Page:", itemsPerPage);
      console.log("Shift Staff List Query:", shiftStaffList.toSQL().toNative());

      throw error;
    }
  },

  // ----------------------------UPDATE EXISTING SHIFT------------------------------
  async updateShift(shift_id, updatedShiftData) {
    try {
      // Check if shift exists
      const existingShift = await knex("SHIFTS")
        .select("*")
        .where("shift_id", shift_id)
        .first();

      if (!existingShift) {
        return {
          status: false,
          message: "Shift not found",
        };
      }

      // Update shift data without using RETURNING
      const updateResult = await knex("SHIFTS")
        .where("shift_id", shift_id)
        .update({
          shift_name: updatedShiftData.shift_name || existingShift.shift_name,
          start_time: updatedShiftData.start_time || existingShift.start_time,
          end_time: updatedShiftData.end_time || existingShift.end_time,
        });

      // Check if any rows were updated
      if (updateResult === 0) {
        return {
          status: false,
          message: "Failed to update shift (no rows affected)",
        };
      }

      console.log("Shift updated successfully");
      return {
        status: true,
        message: "Shift updated successfully",
      };
    } catch (error) {
      console.error("Error during updating shift:", error);
      return {
        status: false,
        message: "Error during updating shift",
        error: error.message,
      };
    }
  },
};

module.exports = handleShiftService;
