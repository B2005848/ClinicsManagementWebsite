const bcrypt = require("bcryptjs");
const { knex } = require("../../db.config");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountPatientServices = {
  // ---------------------------------CREATE ACCOUNT SERVICE----------------------------------------------
  async createAccount(accountData, patient_detailsData) {
    let transaction;
    try {
      transaction = await knex.transaction();
      // status = 1: account active, 2: temporarily locked, 3: Stop working
      accountData.status = "1";
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwd_hash = await bcrypt.hash(accountData.password, salt);
      accountData.password = passwd_hash;
      accountData.salt = salt;

      // check account exists?
      const accountExisting = await transaction("PATIENT_ACCOUNTS")
        .where("patient_id", accountData.patient_id)
        .first();

      if (!accountExisting) {
        // Add a new account
        await transaction("PATIENT_ACCOUNTS").insert(accountData);
        // get id a new account was created, and then assign it = id'patient_details table
        patient_detailsData.patient_id = accountData.patient_id;
        // insert information into table patient_details
        await transaction("PATIENT_DETAILS").insert(patient_detailsData);
        // done commit transaction
        await transaction.commit();
        console.log("create a patient account success", [patient_detailsData]);
        return {
          status: true,
          message: "create a patient account success",
          data: accountData.patient_id,
        };
      } else {
        await transaction.rollback();
        console.log("create a patient account fail: account already exists", [
          accountData,
        ]);
        return {
          status: false,
          message: "create a patient account fail: account already exists",
        };
      }
    } catch (error) {
      if (transaction) await transaction.rollback();
      console.log("create a patient account fail", error);
      return {
        status: false,
        message: "create a patient account fail: an error occurred",
        error: error.message,
      };
    }
  },

  // ----------------------------------LOGIN SERVICE----------------------------------------------------------
  async checkLogin(username, password) {
    try {
      const usernameExisting = await knex("PATIENT_ACCOUNTS")
        .where("patient_id", username)
        .first();
      if (usernameExisting) {
        const salt = usernameExisting.salt;
        const passwd_hash = await bcrypt.hash(password, salt);
        if (passwd_hash === usernameExisting.password) {
          console.log(`Login success with username: ${username}`);

          // Create access Token
          const accessToken = jwt.sign(
            {
              patient_id: usernameExisting.patient_id,
              username: usernameExisting.first_name,
            },
            process.env.JWT_SECRET_PA,
            {
              // expiresIn 120 minute
              expiresIn: "120m",
            }
          );

          // Create refresh Token
          const refreshToken = jwt.sign(
            {
              patient_id: usernameExisting.patient_id,
            },
            process.env.JWT_SECRET_PA,
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
      const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET_PA);
      if (!decoded) {
        throw new Error("Invalid refresh token!");
      }

      // create new access token by refreshToken
      const accessToken = jwt.sign(
        {
          patient_id: decoded.patient_id,
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
      const decoded = jwt.verify(accessToken, process.env.JWT_SECRET_PA);
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
      const decoded = jwt.verify(refeshToken, process.env.JWT_SECRET_PA);
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

  // ------------------------------UPDATE STATUS ACCOUNT-----------------------------------------
  async updateStatusAccount(patient_id, status_id) {
    try {
      const result = await knex("PATIENT_ACCOUNTS")
        .where("patient_id", patient_id)
        .update("status", status_id);
      if (result) {
        return { success: true, message: "Status updated successfully" };
      } else {
        return { success: false, message: "Failed to update status" };
      }
    } catch (error) {
      console.error("Error during update status account:", error);
      throw error;
    }
  },

  // Đổi mật khẩu với email
  async changePassword(email, new_password) {
    let transaction;
    try {
      // Start a new transaction
      transaction = await knex.transaction();

      // Generate new salt and hash for the password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwd_hash = await bcrypt.hash(new_password, salt);

      // Check if account exists and get patient_id
      const account = await transaction("PATIENT_ACCOUNTS as pa")
        .select("pa.patient_id")
        .join("PATIENT_DETAILS as pd", "pa.patient_id", "pd.patient_id")
        .where("pd.email", email)
        .first();

      if (!account) {
        await transaction.rollback();
        console.log("Change password failed: account does not exist", email);
        return {
          status: false,
          message: "Account does not exist",
        };
      }

      // Update password and salt for the existing account
      await transaction("PATIENT_ACCOUNTS")
        .where("patient_id", account.patient_id)
        .update({
          password: passwd_hash,
          salt: salt,
        });

      // Commit the transaction
      await transaction.commit();

      console.log(
        "Password change success for patient_id:",
        account.patient_id
      );
      return {
        status: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      // Rollback the transaction in case of error
      if (transaction) await transaction.rollback();

      console.log("Change password failed", error.message);
      return {
        status: false,
        message: "Change password failed: an error occurred",
        error: error.message,
      };
    }
  },

  // Đổi mật khẩu khi nhớ mật khẩu cũ
  async changePasswordOld(patient_id, new_password) {
    let transaction;
    try {
      // Start a new transaction
      transaction = await knex.transaction();

      // Generate new salt and hash for the password
      const saltRounds = 10;
      const salt = await bcrypt.genSalt(saltRounds);
      const passwd_hash = await bcrypt.hash(new_password, salt);

      // Check if account exists and get patient_id
      const account = await transaction("PATIENT_ACCOUNTS")
        .where("patient_id", patient_id)
        .first();

      if (!account) {
        await transaction.rollback();
        console.log(
          "Change password failed: account does not exist",
          patient_id
        );
        return {
          status: false,
          message: "Account does not exist",
        };
      }

      // Update password and salt for the existing account
      await transaction("PATIENT_ACCOUNTS")
        .where("patient_id", account.patient_id)
        .update({
          password: passwd_hash,
          salt: salt,
        });

      // Commit the transaction
      await transaction.commit();

      console.log(
        "Password change success for patient_id:",
        account.patient_id
      );
      return {
        status: true,
        message: "Password changed successfully",
      };
    } catch (error) {
      // Rollback the transaction in case of error
      if (transaction) await transaction.rollback();

      console.log("Change password failed", error.message);
      return {
        status: false,
        message: "Change password failed: an error occurred",
        error: error.message,
      };
    }
  },

  // Service - Kiểm tra mật khẩu cũ
  async checkOldPassword(patient_id, old_password) {
    try {
      const account = await knex("PATIENT_ACCOUNTS")
        .where("patient_id", patient_id)
        .first();
      if (!account) {
        return { isCorrect: false };
      }

      // So sánh mật khẩu cũ với mật khẩu đã hash trong cơ sở dữ liệu
      const isMatch = await bcrypt.compare(old_password, account.password);
      return { isCorrect: isMatch };
    } catch (error) {
      throw new Error("Error checking old password");
    }
  },

  // Check tài khoản bệnh nhân có tồn tại để đặt lịch khám hay không
  async checkAccountExisting(patient_id) {
    try {
      const account = await knex("PATIENT_ACCOUNTS")
        .where("patient_id", patient_id)
        .first();
      if (!account) {
        return {
          status: false,
          message: "Account doesn't existing",
        };
      } else {
        return {
          status: true,
          message: "Account existing",
        };
      }
    } catch (error) {
      throw new Error("Lỗi server");
    }
  },
};

// Export đối tượng chứa các hàm
module.exports = accountPatientServices;
