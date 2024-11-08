const { knex } = require("../../db.config");

const hanleRolesServices = {
  //----------------------------------------------GET LIST ROLES FOR ADMIN--------------------------------
  async getListRoles() {
    try {
      // Lấy toàn bộ danh sách các chức vụ từ bảng ROLES
      const listRoles = await knex("ROLES").select("*");

      if (listRoles.length > 0) {
        return {
          status: true,
          message: "Roles list retrieved successfully",
          listRoles: listRoles,
        };
      } else {
        return {
          status: false,
          message: "No roles available in the system",
          listRoles: [],
        };
      }
    } catch (error) {
      console.error("An error occurred while retrieving roles list:", error);
      throw error;
    }
  },

  //----------------------------------------------CREATE NEW ROLE--------------------------------
  async createRole(roleData) {
    try {
      const [newRoleId] = await knex("ROLES")
        .insert(roleData)
        .returning("role_id");
      return {
        status: true,
        message: "Role created successfully",
        roleId: newRoleId,
      };
    } catch (error) {
      console.error("An error occurred while creating role:", error);
      throw error;
    }
  },

  //----------------------------------------------UPDATE ROLE BY ID--------------------------------
  async updateRoleById(role_id, roleData) {
    try {
      const updated = await knex("ROLES").where({ role_id }).update(roleData);

      if (updated) {
        return {
          status: true,
          message: "Role updated successfully",
        };
      } else {
        return {
          status: false,
          message: "Role not found",
        };
      }
    } catch (error) {
      console.error("An error occurred while updating role:", error);
      throw error;
    }
  },

  //----------------------------------------------DELETE ROLE BY ID--------------------------------
  async deleteRoleById(role_id) {
    try {
      const deleted = await knex("ROLES").where({ role_id }).del();

      if (deleted) {
        return {
          status: true,
          message: "Role deleted successfully",
        };
      } else {
        return {
          status: false,
          message: "Role not found",
        };
      }
    } catch (error) {
      console.error("An error occurred while deleting role:", error);
      throw error;
    }
  },
};

module.exports = hanleRolesServices;
