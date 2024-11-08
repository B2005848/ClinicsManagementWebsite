const ApiError = require("../api-error");
const handleSpecialtiesServices = require("../Services/handle.specialties.services");

const handleSpecialtiesController = {
  // ---------------GET LIST OF SPECIALTIES----------------
  async getSpecialties(req, res, next) {
    try {
      const page = parseInt(req.query.page) || 1;
      const { message, totalPages, itemsPerPage, listSpecialties } =
        await handleSpecialtiesServices.getListSpecialties(page);
      res.json({ page, message, totalPages, itemsPerPage, listSpecialties });
      console.log({ message, totalPages, listSpecialties });
    } catch (error) {
      next(new ApiError(400, "get all specialties fail!"));
    }
  },

  // ---------------GET LIST OF ALL SPECIALTIES----------------
  async getAllSpecialties(req, res, next) {
    try {
      const { status, message, listSpecialties } =
        await handleSpecialtiesServices.getAllSpecialties();

      if (status) {
        res.json({ message, listSpecialties });
      } else {
        res.status(404).json({ message });
      }

      console.log({ message, listSpecialties });
    } catch (error) {
      next(new ApiError(400, "Failed to get all specialties"));
    }
  },
};

module.exports = handleSpecialtiesController;
