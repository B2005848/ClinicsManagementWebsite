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

  // --------------------- GET PATIENT RECORD BY PATIENT ID -------------------
  async getPatientRecordsByPatientId(patient_id) {
    try {
      // Truy vấn bảng PATIENT_RECORDS và liên kết với bảng HEALTH_METRICS
      const records = await knex("PATIENT_RECORDS as pr")
        .select(
          "pr.record_id",
          "pr.diagnosis",
          "pr.doctor_id",
          "sd.first_name as first_name_doctor",
          "sd.last_name as last_name_doctor",
          "pr.appointment_id",
          "pr.treatment",
          "pr.reason",
          "pr.created_at",
          "hm.weight",
          "hm.height",
          "hm.blood_pressure",
          "hm.heart_rate",
          "hm.temperature",
          "hm.respiratory_rate",
          "hm.blood_sugar",
          "hm.cholesterol"
        )
        .join("HEALTH_METRICS as hm", "hm.record_id", "pr.record_id")

        .join("STAFF_DETAILS as sd", "sd.staff_id", "pr.doctor_id")
        .where("pr.patient_id", patient_id)
        .orderBy("pr.created_at", "desc"); // Sắp xếp theo ngày tạo hồ sơ mới nhất

      if (records.length > 0) {
        return {
          status: true,
          message: "Patient records found",
          data: records,
        };
      } else {
        return {
          status: false,
          message: "No records found for this patient",
        };
      }
    } catch (error) {
      console.error("Error retrieving patient records:", error);
      return {
        status: false,
        message: "An error occurred while retrieving patient records",
        error: error.message,
      };
    }
  },
};

module.exports = handlePatientService;
