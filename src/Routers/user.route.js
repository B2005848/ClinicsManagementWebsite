// url
const express = require("express");
const userController = require("../Controllers/users.controller");
const router = express.Router();

router.post("/login", userController.checkuserlogin);
router.post("/admin/login", userController.checkadminlogin);

router.post("/create", userController.createUser);

router.get("/getusers", userController.getUsers);
router.get("/getALLusers", userController.getALLUsers);

router.get("/getuserbyusername/:username", userController.getUserByUsername);
router.get("/getuserbyusername/", userController.getUserByUsername);

router.put("/update_user/:username", userController.updateUser);
router.delete("/delete_user/:username", userController.deleteUser);
router.delete("/delete_user/", userController.deleteUser);

module.exports = router;
