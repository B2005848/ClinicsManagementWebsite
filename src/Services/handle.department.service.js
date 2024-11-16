const { knex } = require("../../db.config");

const handleDepartment = {
  //----------------------------------------------GET LIST DEPARTMENTS FOR ADMIN--------------------------------
  async getDepartmentsForAdmin(page) {
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
          itemsPerPage,
          listDepartments: departments,
        };
      }
    } catch (error) {
      console.error("Error occured get departments:", error);
      throw error;
    }
  },
  //----------------------------------------------GET LIST DEPARTMENTS FOR PATIENTS--------------------------------
  async getDepartmentsForPatient(page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Get totals quantity departments
      const totalDepartments = await knex("DEPARTMENTS")
        .count("* as totalCount")
        .whereNot("department_id", "CASH")
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
        .whereNot("department_id", "CASH")
        .limit(itemsPerPage)
        .offset(offset);

      if (departments) {
        return {
          status: true,
          message: "Departments retrieved successfully",
          totalPages,
          itemsPerPage,
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

  // -------------------------- DELETE A DEPARTMENT------------------------------------
  async deleteDepartment(departmentId) {
    try {
      // Check if department exists
      const existingDepartment = await knex("DEPARTMENTS")
        .where("department_id", departmentId)
        .first();
      if (!existingDepartment) {
        return {
          status: false,
          message: "Department not found",
        };
      }
      // Delete department
      const resultDelete = await knex("DEPARTMENTS")
        .where("department_id", departmentId)
        .del();
      if (resultDelete) {
        return {
          status: true,
          message: "Department deleted successfully",
        };
      } else {
        return {
          status: false,
          message: "Failed to delete department",
        };
      }
    } catch (error) {
      console.error("Error occured delete department:", error);
      throw error;
    }
  },

  //-------------------------------- MODIFY INFORMATION DEPARTMENT---------------------------------------
  async modifyDepartment(departmentId, departmentData) {
    try {
      // Check if department exists
      const existingDepartment = await knex("DEPARTMENTS")
        .where("department_id", departmentId)
        .first();
      if (!existingDepartment) {
        return {
          status: false,
          message: "Department not found",
        };
      }
      // Update department
      const resultUpdate = await knex("DEPARTMENTS")
        .where("department_id", departmentId)
        .update(departmentData);
      if (resultUpdate) {
        return {
          status: true,
          message: "Department updated successfully",
        };
      } else {
        return {
          status: false,
          message: "Failed to update department",
        };
      }
    } catch (error) {
      console.error("Error occured modify department:", error);
      throw error;
    }
  },

  //------------------- SEARCH DEPARTMENTS --------------------
  async searchDepartments(query) {
    try {
      // Search departments by id, description, name
      const deparmentList = await knex("DEPARTMENTS as dep")
        .select("dep.*")
        .where(function () {
          this.where("dep.department_id", "like", `%${query}%`)
            .orWhere("dep.department_name", "like", `%${query}%`)
            .orWhere("dep.description", "like", `%${query}%`);
        })
        .orderBy("dep.department_id", "asc");
      if (deparmentList.length > 0) {
        console.log("Search department success");
        return {
          success: true,
          message: "Department list",
          data: deparmentList,
        };
      } else {
        console.log("Search departments not found");
        return {
          success: false,
          message: "department not found",
        };
      }
    } catch (error) {
      console.error("Error during search departments :", error);
      return {
        status: false,
        message: "Error during search deparments",
        error: error.message,
      };
    }
  },

  //------------------- GET DEPARTMENTS BY SPECIALTY --------------------
  async getDepartmentsBySpecialty(specialtyId) {
    try {
      // Truy vấn để lấy danh sách phòng ban có liên quan đến `specialty_id` từ bảng SERVICES
      const departments = await knex("SERVICES as s")
        .distinct("d.department_id", "d.department_name")
        .join("DEPARTMENTS as d", "s.department_id", "d.department_id")
        .where("s.specialty_id", specialtyId)
        .orderBy("d.department_id", "asc");

      // Kiểm tra kết quả và trả về
      if (departments.length > 0) {
        return {
          status: true,
          message: "Departments retrieved successfully",
          data: departments,
        };
      } else {
        return {
          status: false,
          message: "No departments found for this specialty",
        };
      }
    } catch (error) {
      console.error(
        "Error occurred while getting departments by specialty:",
        error
      );
      return {
        status: false,
        message: "Error retrieving departments by specialty",
        error: error.message,
      };
    }
  },

  //---------------------------------------------- CHECK IF DEPARTMENT NAME EXISTS -----------------------------------------
  async checkDepartmentNameExists(departmentName) {
    try {
      // Kiểm tra xem tên phòng đã tồn tại chưa
      const existingDepartment = await knex("DEPARTMENTS")
        .where("department_name", departmentName)
        .first();

      if (existingDepartment) {
        return {
          status: true,
          message: "Department name already exists", // Trả về thông báo tên phòng đã tồn tại
        };
      } else {
        return {
          status: false,
          message: "Department name is available", // Tên phòng chưa tồn tại
        };
      }
    } catch (error) {
      console.error("Error occurred while checking department name:", error);
      throw error;
    }
  },

  //---------------------------------------------- CHECK IF DEPARTMENT ID EXISTS -----------------------------------------
  async checkDepartmentIdExists(departmentId) {
    try {
      // Kiểm tra xem ID phòng đã tồn tại chưa
      const existingDepartment = await knex("DEPARTMENTS")
        .where("department_id", departmentId)
        .first();

      if (existingDepartment) {
        return {
          status: true,
          message: "department_id already exists", // Trả về thông báo ID phòng đã tồn tại
        };
      } else {
        return {
          status: false,
          message: "department_id is available", // ID phòng chưa tồn tại
        };
      }
    } catch (error) {
      console.error("Error occurred while checking department ID:", error);
      throw error;
    }
  },

  // Lấy thông tin chi tiết phòng khám
  async getDepartmentDetail(departmentId) {
    try {
      // Kiểm tra xem ID phòng đã tồn tại chưa
      const department = await knex("DEPARTMENTS")
        .where("department_id", departmentId)
        .first();

      if (department) {
        return {
          status: true,
          message: "Get detail department success",
          data: department,
        };
      } else {
        return {
          status: false,
          message: "Get detail department fails",
        };
      }
    } catch (error) {
      console.error("Error occurred while get data by department ID:", error);
      throw error;
    }
  },

  //Lấy danh sách nhân viên theo phòng làm việc
  async getListStaffByDepId(department_id, page) {
    try {
      const itemsPerPage = 10;

      const offset = (page - 1) * itemsPerPage;

      const totalShitfStaff = await knex("STAFF_SHIFTS")
        .count("* as totalCount")
        .where("STAFF_SHIFTS.department_id", department_id)
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
      const listStaffByDep = await knex("STAFF_SHIFTS as ss")
        .select(
          "ss.staff_id",
          "sd.first_name",
          "sd.last_name",
          "sd.email",
          "rol.role_name"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "ss.staff_id")
        .join("STAFF_ACCOUNTS as sc", "sc.staff_id", "ss.staff_id")
        .join("ROLES as rol", "rol.role_id", "sc.role_id")
        .where("ss.department_id", department_id)
        .orderBy("rol.role_name", "asc")
        .groupBy(
          "ss.staff_id",
          "sd.first_name",
          "sd.last_name",
          "sd.email",
          "rol.role_name"
        )
        .limit(itemsPerPage)
        .offset(offset);

      if (listStaffByDep.length === 0) {
        console.log({
          status: false,
          message: "staff list by deparment_id is empty",
          totalPages,
          listStaffByDep,
          itemsPerPage,
        });
        return {
          status: false,
          message: "staff list by deparment_id is empty",
          totalPages,
          listStaffByDep,
          itemsPerPage,
        };
      } else {
        console.log({
          status: true,
          message: "List staff by deparment_id",
          totalPages,
          listStaffByDep,
          itemsPerPage,
        });
        return {
          status: true,
          message: "List staff by deparment_id",
          totalPages,
          listStaffByDep,
          itemsPerPage,
        };
      }
    } catch (error) {
      console.error("Error during get list shifts :", error.message);
      console.log("Department ID:", department_id);

      throw error;
    }
  },
};

module.exports = handleDepartment;
