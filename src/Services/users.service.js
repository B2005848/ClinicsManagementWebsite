const bcrypt = require("bcryptjs");
// check_login
async function checkuserLogin(username, clientPassword) {
  try {
    const user = await knex("users")
      .select("users.*", "userroles.RoleID as RoleID", "userdetails.*")
      .join("userroles", "users.UserID", "userroles.UserID")
      .join("userdetails", "users.UserID", "userdetails.UserID")
      .where("users.username", username)
      .first();
    console.log(user);
    if (user) {
      const ID_roles = user.RoleID;
      if (ID_roles !== "Ad") {
        const salt = user.salt;
        console.log(salt);
        const hashedPassword = await bcrypt.hash(clientPassword, salt);
        console.log(hashedPassword);

        if (hashedPassword === user.Password) {
          console.log(`Login success with username: ${username}`);
          return user;
        } else {
          console.log(`Incorrect password for username: ${username}`);
        }
      } else if (ID_roles == "Ad") {
        console.log("dont permision");
      }
    } else {
      console.log(`User with username: "${username}" not found`);
      return user;
    }
  } catch (error) {
    throw error;
  }
}

// check admin login
async function checkAdminLogin(username, clientPassword) {
  try {
    const Ad_user = await knex("users")
      .select("users.*", "userroles.RoleID as RoleID")
      .join("userroles", "users.UserID", "userroles.UserID")
      .where("users.username", username)
      .first();

    // show rowDataPacket
    console.log(Ad_user);
    if (Ad_user) {
      const ID_roles = Ad_user.RoleID;
      if (ID_roles == "Ad") {
        const salt = Ad_user.salt;
        console.log(`salt: ${salt}`);
        const hashedPassword = await bcrypt.hash(clientPassword, salt);
        console.log(`password be hash: ${hashedPassword}`);

        if (hashedPassword === Ad_user.Password) {
          console.log(`Login success with username: ${username}`);
          return Ad_user;
        } else {
          console.log(`Incorrect password for username: ${username}`);
        }
      } else if (ID_roles !== "Ad") {
        console.log("user is not ADMIN");
      }
    } else {
      console.log(`User with username: "${username}" not found`);
      return Ad_user;
    }
  } catch (error) {
    throw error;
  }
}
// create user with JSON
async function createUser(userData, userDetailsData) {
  let transaction;

  try {
    transaction = await knex.transaction();
    userData.statusAccount = "1";
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const hashedPassword = await bcrypt.hash(userData.password, salt);
    userData.password = hashedPassword;
    userData.salt = salt;
    const [userId] = await transaction("users").insert(userData);
    userDetailsData.user_id = userId;

    await transaction("Patient_details").insert(userDetailsData);
    userDetailsData.user_id = userId;
    await transaction.commit();
    console.log("create user success with data:", [
      [userData, userDetailsData],
    ]);
    return {
      userData,
      userDetailsData,
    };
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
    }
    throw error;
  }
}

// get user by username
async function getUserByUsername(username) {
  try {
    const user = await knex("users")
      .select(
        "users.*",
        "status.StatusName as StatusName",
        "userdetails.*",
        "userroles.RoleID as RoleID"
      )
      .join("status", "users.StatusID", "status.StatusID")
      .join("userdetails", "users.UserID", "userdetails.UserID")
      .join("userroles", "users.UserID", "userroles.UserID")
      .where("users.username", username)
      .first();

    if (user) {
      console.log(`Information with username: ${username} are`, [user]);
      return user;
    } else {
      console.log(`${username} does not exist`);
      return user;
    }
  } catch (error) {
    throw error;
  }
}

// get all list user
async function getUsers(page) {
  try {
    const itemsPerPage = 5;
    const offset = (page - 1) * itemsPerPage;

    const totalUsers = await knex("users").count("* as totalCount").first();
    const totalItems = totalUsers.totalCount;

    // Math.ceil lam tron
    const totalPages = Math.ceil(totalItems / itemsPerPage);

    const users = await knex("users")
      .select(
        "users.*",
        "status.StatusName as StatusName",
        "userroles.RoleID as RoleID"
      )
      .leftJoin("status", "users.StatusID", "status.StatusID")
      .leftJoin("userroles", "users.UserID", "userroles.UserID")
      .where("userroles.RoleID", "Cus")
      .limit(itemsPerPage)
      .offset(offset);
    console.log("Get list user success:");
    console.log(users);

    return { users, totalPages };
  } catch (error) {
    console.log("Get list user fail", error);
    throw error;
  }
}

async function getALLUsers() {
  try {
    const users = await knex("users")
      .select(
        "users.*",
        "status.StatusName as StatusName",
        "userroles.RoleID as RoleID"
      )
      .leftJoin("status", "users.StatusID", "status.StatusID")
      .leftJoin("userroles", "users.UserID", "userroles.UserID")
      .where("userroles.RoleID", "Cus");

    console.log("Get list user success:");
    console.log(users);

    return { users };
  } catch (error) {
    console.log("Get list user fail", error);
    throw error;
  }
}

// update user
async function updateUser(username, userDetailsData) {
  try {
    const user = await knex("users").where("Username", username).first();

    if (!user) {
      console.log("Username does not exist");
      return null;
    }

    const userId = user.UserID;

    const updateUser = await knex("userdetails")
      .where("UserID", userId)
      .update(userDetailsData);
    if (updateUser) {
      console.log("Received data:", userDetailsData);
      console.log(`Update user details for ${username} success`);
      return username;
    } else {
      console.log("Error");
      return null;
    }
  } catch (error) {
    if (transaction) {
      console.log("An error while updating user details", error);
    }
    throw error;
  }
}
// delete with username
async function deleteUser(username) {
  let transaction;
  try {
    transaction = await knex.transaction();

    const user = await transaction("users").where("Username", username).first();
    if (!user) {
      console.log("Username does not exist");
      await transaction.rollback();
      return null;
    }

    const userId = user.UserID;

    await transaction("userroles").where("UserID", userId).del();
    await transaction("userdetails").where("UserID", userId).del();
    await transaction("users").where("UserID", userId).del();

    await transaction.commit();
    console.log(`Delete user with ${username} success`);
    return username;
  } catch (error) {
    if (transaction) {
      await transaction.rollback();
      console.log("An error while deleting user", error);
    }
    throw error;
  }
}

module.exports = {
  checkuserLogin,
  getALLUsers,
  checkAdminLogin,
  createUser,
  getUserByUsername,
  getUsers,
  updateUser,
  deleteUser,
};
