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
          "r.role_id",
          "r.role_name as role_name",
          "sa.status as statusAccount"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .join("ROLES as r", "r.role_id", "sa.role_id")
        .where("sa.staff_id", staffId)
        .first();

      const staff_specialty = await knex("STAFF_SPECIALTY as sp")
        .select("sp.specialty_id", "spe.specialty_name")
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

  // ----------------SELECT SHIFT OF DOCTOR BY DEPARTMENT_ID, SPECIALTY_ID AND DOCTOR_ID----------------
  async getDoctorShifts(department_id, specialty_id, doctor_id) {
    try {
      // Truy xuất danh sách ca làm việc của bác sĩ dựa vào department_id, specialty_id và doctor_id
      const shifts = await knex("STAFF_SHIFTS as ss")
        .select(
          "s.shift_name",
          knex.raw("TRIM(s.shift_id) as shift_id"),
          "ss.shift_date as start_shift",
          "ss.shift_end_date as end_shift",
          "s.start_time",
          "s.end_time"
        )

        .join("SHIFTS as s", "s.shift_id", "ss.shift_id")
        .where("ss.staff_id", doctor_id)
        .andWhere("ss.department_id", department_id)
        .andWhere("ss.specialty_id", specialty_id);

      // Kiểm tra nếu không có ca làm việc nào
      if (shifts.length === 0) {
        console.log("No shifts found for the specified doctor!");
        return {
          success: false,
          message: "No shifts found for the specified doctor",
        };
      }

      console.log(`Get shifts for doctor ${doctor_id} success!`);
      return {
        success: true,
        message: "Doctor shift list",
        data: shifts,
      };
    } catch (error) {
      console.error("Error during get doctor shifts:", error);
      return {
        success: false,
        message: "Error during get doctor shifts",
        error: error.message,
      };
    }
  },

  // Thông tin ca làm việc của nhân viên
  async getInformationShift(staff_id) {
    try {
      // Get information shifts for the staff
      const shiftStaffList = await knex("STAFF_SHIFTS as ss")
        .select(
          "ss.shift_date",
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
        .join("STAFF_ACCOUNTS as sc", "sc.staff_id", "ss.staff_id")
        .join("SPECIALTIES as spe", "spe.specialty_id", "ss.specialty_id")
        .join("ROLES as rol", "rol.role_id", "sc.role_id")
        .where("ss.staff_id", staff_id)
        .orderBy("ss.shift_date", "asc");

      // Kiểm tra nếu không có ca làm việc nào
      if (!shiftStaffList || shiftStaffList.length === 0) {
        console.log({
          status: false,
          message: "shift list is empty",
          shiftStaffList: shiftStaffList,
        });
        return {
          status: false,
          message: "Shift list is empty",
          shiftStaffList: [],
        };
      } else {
        console.log({
          status: true,
          message: "List shift of staff",
          shiftStaffList: shiftStaffList,
        });
        return {
          status: true,
          message: "List shift of staff",
          shiftStaffList: shiftStaffList,
        };
      }
    } catch (error) {
      console.error("Error during get list shifts:", error.message);
      // In ra câu lệnh SQL đã thực thi khi có lỗi
      console.log(
        "Shift Staff List Query:",
        knex("STAFF_SHIFTS as ss").toSQL().toNative()
      );
      throw error;
    }
  },

  // ---------------------------THÊM CHUYÊN KHOA CHO NHÂN VIÊN---------------------------
  async addSpecialtiesForStaff(staffId, specialtyIds) {
    try {
      // Kiểm tra nếu specialtyIds là một mảng
      if (!Array.isArray(specialtyIds)) {
        throw new Error("specialtyIds phải là một mảng chứa các specialty_id");
      }

      // Chuẩn bị dữ liệu để chèn vào bảng STAFF_SPECIALTY
      const specialtiesToAdd = specialtyIds.map((specialtyId) => ({
        staff_id: staffId,
        specialty_id: specialtyId,
      }));

      // Chèn dữ liệu vào bảng
      await knex("STAFF_SPECIALTY").insert(specialtiesToAdd);

      console.log(`Đã thêm chuyên khoa cho nhân viên ${staffId} thành công!`);
      return {
        success: true,
        message: "Chuyên khoa đã được thêm cho nhân viên.",
      };
    } catch (error) {
      console.error("Lỗi khi thêm chuyên khoa cho nhân viên:", error);
      return {
        success: false,
        message: "Lỗi khi thêm chuyên khoa cho nhân viên.",
        error: error.message,
      };
    }
  },

  // Thêm ca làm việc cho nhân viên
  async addShiftsForStaff(staffId, shifts) {
    try {
      // Kiểm tra nếu shifts là một mảng
      if (!Array.isArray(shifts) || shifts.length === 0) {
        throw new Error("Shifts phải là một mảng chứa các ca làm việc hợp lệ.");
      }

      // Kiểm tra từng đối tượng trong shifts có đủ dữ liệu cần thiết
      const shiftsToAdd = shifts.map((shift) => {
        if (
          !shift.shift_id ||
          !shift.shift_date ||
          !shift.shift_end_date ||
          !shift.department_id ||
          !shift.specialty_id
        ) {
          throw new Error("Thiếu thông tin cần thiết trong ca làm việc.");
        }
        return {
          staff_id: staffId,
          shift_id: shift.shift_id,
          shift_date: shift.shift_date,
          shift_end_date: shift.shift_end_date,
          department_id: shift.department_id,
          specialty_id: shift.specialty_id,
        };
      });

      // Sử dụng giao dịch để đảm bảo tính toàn vẹn của dữ liệu
      await knex.transaction(async (trx) => {
        await trx("STAFF_SHIFTS").insert(shiftsToAdd);
      });

      console.log(
        `Đã thêm các ca làm việc cho nhân viên ${staffId} thành công!`
      );
      return {
        success: true,
        message: "Các ca làm việc đã được thêm cho nhân viên.",
      };
    } catch (error) {
      console.error("Lỗi khi thêm ca làm việc cho nhân viên:", error);
      return {
        success: false,
        message: "Lỗi khi thêm ca làm việc cho nhân viên.",
        error: error.message,
      };
    }
  },
};

module.exports = handleStaffService;
