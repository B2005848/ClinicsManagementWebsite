const bcrypt = require("bcryptjs");
const { knex } = require("../../db.config");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountStaffService = {
  // --------------------------------CREATE ACCOUNT STAFF-------------------------------
  async createAccount(accountData, staff_detailsData) {
    let transaction;
    try {
      transaction = await knex.transaction();
      if (!accountData.password) {
        throw new Error("Password is required");
      }
      // status = 1: account active, 2: temporarily locked, 3: Stop working
      accountData.status = "1";
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwd_hash = await bcrypt.hash(accountData.password, salt);
      accountData.password = passwd_hash;
      accountData.salt = salt;

      // check account exits?
      const checkAccount = await knex("STAFF_ACCOUNTS")
        .where("staff_id", accountData.staff_id)
        .first();
      if (!checkAccount) {
        // Add a new account
        await transaction("STAFF_ACCOUNTS").insert(accountData);
        // Get staff_id was just created assign it to staff_id of staff_detailsData
        staff_detailsData.staff_id = accountData.staff_id;
        // Insert information of staff into STAFF_DETAILS table
        await transaction("STAFF_DETAILS").insert(staff_detailsData);
        await transaction.commit();
        console.log("Create a staff account success", [staff_detailsData]);
        return {
          status: true,
          message: "Create a staff account success",
          data: [staff_detailsData],
        };
      } else {
        await transaction.rollback();
        console.log("Account staff already exists", [accountData]);
        return {
          status: false,
          message: "Account staff already exists",
        };
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log("Error creating staff account: ", error);
      return {
        status: false,
        message: "Error create account staff",
        error: error.message,
      };
    }
  },

  // ----------------------------------LOGIN ADMIN SERVICE----------------------------------------------------------
  async checkAdminLogin(username, password) {
    try {
      const usernameExisting = await knex("STAFF_ACCOUNTS")
        .where("staff_id", username)
        .andWhere("role_id", "AD")
        .first();
      if (usernameExisting) {
        const salt = usernameExisting.salt;
        const passwd_hash = await bcrypt.hash(password, salt);
        if (passwd_hash === usernameExisting.password) {
          console.log(`Login success with username: ${username}`);
          // Create access Token
          const accessToken = jwt.sign(
            {
              staff_id: usernameExisting.staff_id,
              username: usernameExisting.first_name,
            },
            process.env.JWT_SECRET,
            {
              // expiresIn 120 minute
              expiresIn: "120m",
            }
          );

          // Create refresh Token
          const refreshToken = jwt.sign(
            {
              staff_id: usernameExisting.staff_id,
            },
            process.env.JWT_SECRET,
            // expiresIn 7 day
            {
              expiresIn: "7d",
            }
          );

          const accessTokenExpiry = Math.floor(Date.now() / 1000) + 120 * 60; // 120 phút
          const refreshTokenExpiry =
            Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 ngày
          console.log(`accessTokenExpiry: ${accessTokenExpiry}`);
          console.log(`refreshTokenExpiry: ${refreshTokenExpiry}`);

          return {
            success: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpiry: accessTokenExpiry,
            refreshTokenExpiry: refreshTokenExpiry,
          };
        } else {
          console.log(`Incorrect password for username: ${username}`);
          return { success: false, message: "Incorrect password" };
        }
      } else {
        console.log(`Username not found: ${username}`);
        return { success: false, message: "Username not found" };
      }
    } catch (error) {
      console.error("Error during login check:", error);
      throw error;
    }
  },

  // --------------------------------------------------- CHECK DOCTOR LOGIN-----------------------------------------
  async checkDoctorLogin(username, password) {
    try {
      const usernameExisting = await knex("STAFF_ACCOUNTS")
        .where("staff_id", username)
        .andWhere("role_id", "BS")
        .first();
      if (usernameExisting) {
        const salt = usernameExisting.salt;
        const passwd_hash = await bcrypt.hash(password, salt);
        if (passwd_hash === usernameExisting.password) {
          console.log(`Login success with username: ${username}`);
          // Create access Token
          const accessToken = jwt.sign(
            {
              staff_id: usernameExisting.staff_id,
              username: usernameExisting.first_name,
            },
            process.env.JWT_SECRET,
            {
              // expiresIn 120 minute
              expiresIn: "120m",
            }
          );

          // Create refresh Token
          const refreshToken = jwt.sign(
            {
              staff_id: usernameExisting.staff_id,
            },
            process.env.JWT_SECRET_DOC,
            // expiresIn 7 day
            {
              expiresIn: "7d",
            }
          );

          const accessTokenExpiry = Math.floor(Date.now() / 1000) + 120 * 60; // 120 phút
          const refreshTokenExpiry =
            Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60; // 7 ngày
          console.log(`accessTokenExpiry: ${accessTokenExpiry}`);
          console.log(`refreshTokenExpiry: ${refreshTokenExpiry}`);

          return {
            success: true,
            accessToken: accessToken,
            refreshToken: refreshToken,
            accessTokenExpiry: accessTokenExpiry,
            refreshTokenExpiry: refreshTokenExpiry,
          };
        } else {
          console.log(`Incorrect password for username: ${username}`);
          return { success: false, message: "Incorrect password" };
        }
      } else {
        console.log(`Username not found: ${username}`);
        return { success: false, message: "Username not found" };
      }
    } catch (error) {
      console.error("Error during login check:", error);
      throw error;
    }
  },

  // ----------------------------------REFRESH ACCESS TOKEN----------------------------------------------------------
  async refreshAccessToken(refreshToken) {
    try {
      if (!refreshToken) {
        throw new Error("Refesh token is require");
      }

      // Verify the refesh Token
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      if (!decoded) {
        throw new Error("Invalid refresh token!");
      }

      // create new access token by refreshToken
      const accessToken = jwt.sign(
        {
          staffId: decoded.staff_id,
          username: decoded.username,
        },
        process.env.JWT_SECRET,
        {
          expiresIn: "120m",
        }
      );
      const accessTokenExpiry = Math.floor(Date.now() / 1000) + 120 * 60; // 120 phút

      return {
        success: true,
        message: "refresh access token success!",
        accessToken: accessToken,
        accessTokenExpiry: accessTokenExpiry,
      };
    } catch (error) {
      console.error("Error refresh access tọken", error);
      return {
        success: false,
        message: error.message,
      };
    }
  },

  // ----------------------------------CHECK ACCESS TOKEN----------------------------------------------------------
  async checkAccessToken(accessToken) {
    try {
      // Kiểm tra Access Token
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
      return {
        success: true,
        message: "Access token is valid.",
        staff_id: decoded.staff_id,
        username: decoded.username,
        expiresAt: decoded.exp, // Lấy thời gian hết hạn
      };
    } catch (error) {
      return {
        success: false,
        message: "Access token is invalid or has expired.",
      };
    }
  },

  // ----------------------------------CHECK REFRESH TOKEN----------------------------------------------------------
  async checkRefreshToken(refeshToken) {
    try {
      // Kiểm tra Access Token
      const decoded = jwt.verify(refeshToken, process.env.JWT_SECRET);
      return {
        success: true,
        message: "Refresh token is valid.",
        staff_id: decoded.staff_id,
        expiresAt: decoded.exp, // Lấy thời gian hết hạn
      };
    } catch (error) {
      return {
        success: false,
        message: "Access token is invalid or has expired.",
      };
    }
  },
};

module.exports = accountStaffService;
