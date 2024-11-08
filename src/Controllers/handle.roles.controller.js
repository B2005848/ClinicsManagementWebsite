const ApiError = require("../api-error");
const hanleRolesServices = require("../Services/handle.roles.services");

const handleRolesController = {
  // ---------------GET LIST OF ROLES----------------
  async getListRoles(req, res, next) {
    try {
      const data = await hanleRolesServices.getListRoles();
      if (data && data.status) {
        return res.status(200).json({
          status: 200,
          message: "Roles list retrieved successfully",
          dataInfo: data.listRoles,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "No roles available",
          dataInfo: [],
        });
      }
    } catch (error) {
      next(new ApiError(500, "An error occurred while retrieving roles list"));
    }
  },

  // ---------------CREATE NEW ROLE----------------
  async createRole(req, res, next) {
    try {
      const roleData = req.body; // Lấy dữ liệu role từ body của yêu cầu
      const result = await hanleRolesServices.createRole(roleData);

      if (result && result.status) {
        return res.status(201).json({
          status: 201,
          message: result.message,
          roleId: result.roleId,
        });
      }
    } catch (error) {
      next(new ApiError(500, "An error occurred while creating role"));
    }
  },

  // ---------------UPDATE ROLE BY ID----------------
  async updateRoleById(req, res, next) {
    try {
      const { role_id } = req.params; // Lấy role_id từ params
      const roleData = req.body; // Lấy dữ liệu cần cập nhật từ body

      const result = await hanleRolesServices.updateRoleById(role_id, roleData);
      if (result && result.status) {
        return res.status(200).json({
          status: 200,
          message: result.message,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Role not found",
        });
      }
    } catch (error) {
      next(new ApiError(500, "An error occurred while updating role"));
    }
  },

  // ---------------DELETE ROLE BY ID----------------
  async deleteRoleById(req, res, next) {
    try {
      const { role_id } = req.params; // Lấy role_id từ params

      const result = await hanleRolesServices.deleteRoleById(role_id);
      if (result && result.status) {
        return res.status(200).json({
          status: 200,
          message: result.message,
        });
      } else {
        return res.status(404).json({
          status: 404,
          message: "Role not found",
        });
      }
    } catch (error) {
      next(new ApiError(500, "An error occurred while deleting role"));
    }
  },
};

module.exports = handleRolesController;
