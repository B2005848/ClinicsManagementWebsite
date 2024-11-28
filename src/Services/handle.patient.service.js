const { knex } = require("../../db.config");

const handlePatientService = {
  // ------------------GET LIST ACCOUNT OF ALL PATIENTS---------------------
  async getListAccountPatients(page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Get total quantity patients
      const totalPatients = await knex("PATIENT_ACCOUNTS")
        .count("* as totalCount")
        .first();
      const totalItems = totalPatients.totalCount;

      // Calculate quantity page
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No patient available.`,
          totalPages,
          patients: [],
        };
      }
      // get list patient by position page
      const patients = await knex("PATIENT_ACCOUNTS as pa")
        .select(
          "pa.*",
          "pd.first_name",
          "pd.last_name",
          "pd.birthday",
          "pd.email",
          "pd.citizen_id"
        )
        .join("PATIENT_DETAILS as pd", "pd.patient_id", "pa.patient_id")
        .orderBy("pa.patient_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);
      if (patients) {
        return {
          status: true,
          message: "Get list patient successfully",
          patients,
          totalPages,
          itemsPerPage,
        };
      }
    } catch (error) {
      console.error("Error retrieving patients:", error);
      throw error;
    }
  },

  // ---------------GET INFORMATION OF PATIENT WITH PATIENT ID----------------
  async getPatientByUsername(patient_id) {
    try {
      const data = await knex("PATIENT_DETAILS as pd")
        .select("pd.*", "pa.status as statusAccount")
        .join("PATIENT_ACCOUNTS as pa", "pa.patient_id", "pd.patient_id")
        .where("pd.patient_id", patient_id)
        .first();
      if (data) {
        return data;
      } else {
        return {
          status: false,
          message: "Patient Details Not Found",
        };
      }
    } catch (error) {
      return {
        status: false,
        message: "Error Occured get data of patient",
        error: error.message,
      };
    }
  },

  // -----------UPDATE INFORMATION DETAIL-------------------------------------
  async updateInformation(patient_id, data) {
    try {
      const patientIdExiting = await knex("PATIENT_DETAILS")
        .where("patient_id", patient_id)
        .first();
      if (patientIdExiting) {
        const updatedPatient = await knex("PATIENT_DETAILS")
          .where("patient_id", patient_id)
          .update(data);
        if (updatedPatient) {
          return {
            success: true,
            message: "Account information updated successfully",
          };
        } else {
          return {
            success: false,
            message: "Failed to update account information",
          };
        }
      } else {
        return { success: false, message: "Patient ID not found" };
      }
    } catch (error) {
      console.error("Error during update account info:", error);
      throw error;
    }
  },

  // --------------------- SEARCH PATIENTS-------------------
  async searchPatients(query) {
    try {
      const patients = await knex("PATIENT_ACCOUNTS as pa")
        .select(
          "pa.*",
          "pd.first_name",
          "pd.last_name",
          "pd.email",
          "pd.citizen_id",
          "pd.birthday"
        )
        .join("PATIENT_DETAILS as pd", "pa.patient_id", "pd.patient_id")
        .where(function () {
          this.where("pa.patient_id", "like", `%${query}%`)
            .orWhere("pd.first_name", "like", `%${query}%`)
            .orWhere("pd.last_name", "like", `%${query}%`)
            .orWhere("pd.citizen_id", "like", `%${query}%`)
            .orWhereRaw("CONCAT(pd.first_name, ' ', pd.last_name) LIKE ?", [
              `%${query}%`,
            ]); // Tìm theo tên đầy đủ
        })
        .orderBy("pa.patient_id", "asc");
      if (patients.length > 0) {
        return {
          success: true,
          message: "Patient found",
          data: patients,
        };
      } else {
        return {
          success: false,
          message: "Patient not found",
        };
      }
    } catch (error) {
      console.error("Error during search patients:", error);
      return {
        status: false,
        message: "An error occurred while searching patients",
        error: error.message,
      };
    }
  },

  // Tạo hồ sơ bệnh nhân cho lịch hẹn
  async createPatientRecord({
    patient_id,
    doctor_id,
    appointment_id,
    diagnosis,
    treatment,
    reason,
    weight,
    height,
    blood_pressure,
    heart_rate,
    temperature,
    respiratory_rate,
    blood_sugar,
    cholesterol,
  }) {
    try {
      // Thêm thông tin hồ sơ bệnh nhân vào bảng PATIENT_RECORDS
      const result = await knex("PATIENT_RECORDS")
        .insert({
          patient_id,
          doctor_id, // ID của nhân viên tạo hồ sơ
          appointment_id, // ID của lịch hẹn
          diagnosis, // Chẩn đoán
          treatment, // Điều trị
          reason, // Lý do khám
        })
        .returning("record_id");

      if (!result) {
        return {
          status: false,
          message: "Failed to create patient record.",
        };
      }

      await knex("HEALTH_METRICS").insert({
        record_id: result[0].record_id,
        weight,
        height,
        blood_pressure,
        heart_rate,
        temperature,
        respiratory_rate,
        blood_sugar,
        cholesterol,
      });

      return {
        status: true,
        message: "Patient record created successfully.",
        record_id: result[0].record_id, // Trả về record_id của hồ sơ đã được tạo
      };
    } catch (error) {
      console.error("Error creating patient record:", error);
      return {
        status: false,
        message: "Failed to create patient record.",
        error,
      };
    }
  },
};

module.exports = handlePatientService;
