// src/routes/roles.routes.js
const express = require("express");
const handleRolesController = require("../Controllers/handle.roles.controller");
const router = express.Router();

router.get("/", handleRolesController.getListRoles);

// Tạo mới một chức vụ
router.post("/", handleRolesController.createRole);

// Cập nhật thông tin của một chức vụ theo role_id
router.put("/:role_id", handleRolesController.updateRoleById);

// Xóa một chức vụ theo role_id (kiểm tra liên kết với STAFF_ACCOUNTS trước khi xóa)
router.delete("/:role_id", handleRolesController.deleteRoleById);
module.exports = router;
