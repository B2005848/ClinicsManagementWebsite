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
          "r.role_name",
          "sd.first_name",
          "sd.last_name",
          "sd.email",
          "sd.citizen_id",
          "sa.created_at",
          "sa.updated_at"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .join("ROLES as r", "sa.role_id", "r.role_id")
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
          itemsPerPage,
        };
      } else {
        console.log(
          `Get staff list success . Total staffs: ${totalStaffsCount}`
        );
        console.log("Response from getStaffAccountList:", {
          staffList,
          totalPages,
          itemsPerPage,
        });
        return {
          status: true,
          message: "Account staff list",
          totalPages,
          staffList,
          itemsPerPage,
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
        .select(
          "sd.*",
          "r.role_name as role_name",
          "sa.status as statusAccount"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .join("ROLES as r", "r.role_id", "sa.role_id")
        .where("sa.staff_id", staffId)
        .first();

      const staff_specialty = await knex("STAFF_SPECIALTY as sp")
        .select("sp.staff_specialty_id", "spe.specialty_name")
        .join("SPECIALTIES as spe", "spe.specialty_id", "sp.specialty_id")
        .where("sp.staff_id", staffId);

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
          data: staffInfo,
          specialty: staff_specialty,
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

  // ---------------------------SELECT DOCTOR BY SPECIALTY------------------
  async selectDoctorBySpecialtyId(specialty_id) {
    try {
      const doctorInfo = await knex("STAFF_SPECIALTY as sp")
        .select(
          "sp.staff_id as doctor_id",
          "sd.first_name",
          "sd.last_name",
          "sd.image_avt"
        )
        .join("STAFF_ACCOUNTS as sa", "sa.staff_id", "sp.staff_id")
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sp.staff_id")
        .where("sa.role_id", "BS")
        .andWhere("sp.specialty_id", specialty_id);

      if (doctorInfo.length > 0) {
        // Lặp qua từng bác sĩ để lấy thông tin ca làm việc
        for (const doctor of doctorInfo) {
          const shifts = await knex("STAFF_SHIFTS as ss")
            .select("s.shift_name")
            .join("SHIFTS as s", "s.shift_id", "ss.shift_id")
            .where("ss.staff_id", doctor.doctor_id);

          const specialty = await knex("STAFF_SPECIALTY as ss")
            .select("s.specialty_name")
            .join("SPECIALTIES as s", "s.specialty_id", "ss.specialty_id")
            .where("ss.staff_id", doctor.doctor_id);
          // Đính kèm danh sách ca làm việc vào đối tượng bác sĩ
          doctor.shifts = shifts.map((shift) => shift.shift_name);

          doctor.specialty = specialty.map(
            (specialty) => specialty.specialty_name
          );
        }

        console.log(`Select doctor by specialty: ${specialty_id} success!`);
        return {
          success: true,
          message: "List doctor",
          data: doctorInfo,
        };
      } else {
        console.log("Doctor not found!");
        return {
          success: false,
          message: "Doctor not found",
        };
      }
    } catch (error) {
      console.error("Error during search doctor :", error);
      return {
        status: false,
        message: "Error during search doctor",
        error: error.message,
      };
    }
  },
};

module.exports = handleStaffService;
