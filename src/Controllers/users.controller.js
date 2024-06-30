const userService = require("../Services/users.service");
const ApiError = require("../api-error");

//check info login
async function checkuserlogin(req, res, next) {
  const username = req.body.username;
  const passwd = req.body.password;

  if (!username) {
    return next(new ApiError(400, "Username can not be empty!"));
  } else if (!passwd) {
    return next(new ApiError(400, "Password can not be empty!"));
  }
  try {
    console.log("Received data from client:", req.body);
    const checklogin = await userService.checkuserLogin(username, passwd);
    if (!checklogin) {
      return res
        .status(404)
        .json(
          "The email address or mobile number you entered isn't connected to an account."
        );
      // The email address or mobile number you entered isn't connected to an account.
    } else {
      return res.json({
        checklogin,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while login"));
  }
}

// check Admin Login
async function checkadminlogin(req, res, next) {
  const username = req.body.username;
  const passwd = req.body.password;

  if (!username) {
    return next(new ApiError(400, "Username can not be empty!"));
  } else if (!passwd) {
    return next(new ApiError(400, "Password can not be empty!"));
  }
  try {
    console.log("Received data from client:", req.body);
    const checklogin = await userService.checkAdminLogin(username, passwd);
    if (!checklogin) {
      return res.status(404).json(
        `The email address or mobile number you entered isn't connected to an account.
          ${username} & ${passwd}`
      );
    } else {
      return res.json({
        checklogin,
      });
    }
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while login"));
  }
}

async function createUser(req, res, next) {
  const username = req.body?.username;
  const password = req.body?.password;
  if (!username || !password) {
    return next(new ApiError(400, "Username and password must be provided."));
  }
  const existingUser = await userService.getUserByUsername(username);
  if (existingUser) {
    return next(
      new ApiError(
        400,
        "Username already exists. Please choose another username."
      )
    );
  }
  try {
    const userData = {
      username: req.body.username,
      password: req.body.password,
    };

    const userDetailsData = {
      firstName: req.body.firstName,
      lastName: req.body.lastName,
      email: req.body.email,
      contactaddress: req.body.contact_address,
      birthday: new Date(req.body.birthday),
    };

    const userRoleData = {
      RoleID: "Cus",
    };
    const user = await userService.createUser(
      userData,
      userDetailsData,
      userRoleData
    );
    return res.status(201).json(user);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while creating the user"));
  }
}

async function getUserByUsername(req, res, next) {
  const username = req.params.username;

  if (!username) {
    return res.status(400).json({ message: "Username is required" });
  }
  try {
    const user = await userService.getUserByUsername(username);

    if (user) {
      return res.json(user);
    } else {
      return res
        .status(404)
        .json({ message: "User not found", username: `${username}` });
    }
  } catch (error) {
    console.error(error);
    return next(new ApiError(500, "An error occurred while fetching user"));
  }
}

//
async function getUsers(req, res, next) {
  try {
    const page = parseInt(req.query.page) || 1;
    const { users, totalPages } = await userService.getUsers(page);

    return res.json({ users, totalPages });
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while fetching users"));
  }
}

async function getALLUsers(req, res, next) {
  try {
    const users = await userService.getALLUsers();

    return res.json(users);
  } catch (error) {
    console.log(error);
    return next(new ApiError(500, "An error occurred while fetching users"));
  }
}

// Trong users.controller.js
async function updateUser(req, res, next) {
  const username = req.body.username || req.params.username;
  const userDetailsData = {
    firstName: req.body.firstName,
    lastName: req.body.lastName,
    email: req.body.email,
    contactaddress: req.body.contact_address,
    ImageURL: req.body.ImageURL,
    birthday: new Date(req.body.birthday),
  };

  try {
    const updatedUsername = await userService.updateUser(
      username,
      userDetailsData
    );
    if (updatedUsername) {
      return res.json({
        message: `Update success for user with username: ${updatedUsername}`,
      });
    } else {
      return next(new ApiError(404, `Username: ${username} does not exist`));
    }
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(
        500,
        `An error occurred while updating user details for username: ${username}`
      )
    );
  }
}

async function deleteUser(req, res, next) {
  const username = req.body.username || req.params.username;
  try {
    const delete_user = await userService.deleteUser(username);
    if (delete_user) {
      return res.json({
        message: `Delete success user with username: ${username}`,
      });
    } else {
      return next(new ApiError(404, `username: ${username} does not exist`));
    }
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(
        500,
        `An error occurred while deleting user with username: ${username}`
      )
    );
  }
}

async function changepassword(req, res, next) {
  const oldpasswd = req.body.oldpasswd;
  const newpasswd = req.body.newpasswd;
  try {
    const delete_user = await userService.deleteUser(username);
    if (delete_user) {
      return res.json({
        message: `Delete success user with username: ${username}`,
      });
    } else {
      return next(new ApiError(404, `username: ${username} does not exist`));
    }
  } catch (error) {
    console.log(error);
    return next(
      new ApiError(
        500,
        `An error occurred while deleting user with username: ${username}`
      )
    );
  }
}
module.exports = {
  checkuserlogin,
  getALLUsers,
  checkadminlogin,
  createUser,
  getUsers,
  getUserByUsername,
  updateUser,
  deleteUser,
  changepassword,
};
