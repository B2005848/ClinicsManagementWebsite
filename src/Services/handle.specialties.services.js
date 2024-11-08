const { knex } = require("../../db.config");

const handleSpecialtiesServices = {
  //----------------------------------------------GET LIST SPECIALTIES FOR ADMIN--------------------------------
  async getListSpecialties(page) {
    try {
      const itemsPerPage = 10;
      const offset = (page - 1) * itemsPerPage;

      // Get totals quantity departments
      const totalSpecialties = await knex("SPECIALTIES")
        .count("* as totalCount")
        .first();
      const totalItems = totalSpecialties.totalCount;
      // Calculate quantity page
      const totalPages = Math.ceil(totalItems / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No deparment available.`,
          totalPages,
          listSpecialties: [],
        };
      }
      // Get departments
      const specialties = await knex("SPECIALTIES")
        .orderBy("specialty_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);

      if (specialties) {
        return {
          status: true,
          message: "specialties retrieved successfully",
          totalPages,
          itemsPerPage,
          listSpecialties: specialties,
        };
      }
    } catch (error) {
      console.error("Error occured get specialties:", error);
      throw error;
    }
  },

  //----------------------------------------------GET ALL SPECIALTIES--------------------------------
  async getAllSpecialties() {
    try {
      // Lấy tất cả chuyên khoa mà không cần phân trang
      const specialties = await knex("SPECIALTIES").orderBy(
        "specialty_id",
        "asc"
      ); // Sắp xếp theo ID chuyên khoa

      if (specialties.length > 0) {
        return {
          status: true,
          message: "Specialties retrieved successfully",
          listSpecialties: specialties,
        };
      } else {
        return {
          status: false,
          message: "No specialties available",
          listSpecialties: [],
        };
      }
    } catch (error) {
      console.error("Error occurred while getting specialties:", error);
      throw error;
    }
  },
};

module.exports = handleSpecialtiesServices;
