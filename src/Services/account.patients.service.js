const bcrypt = require("bcryptjs");
const { knex } = require("../../db.config");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const accountPatientServices = {
  // function createAccount of patient
  async createAccount(accountData, patient_detailsData) {
    let transaction;
    try {
      transaction = await knex.transaction();
      // status= 1: account active
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
        console.log("create a patient account success", [accountData]);
        return {
          status: true,
          message: "create a patient account success",
          data: [accountData],
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

  async deleteAccount(username, password, email) {
    try {
      // get account data
      const accountData = await transaction("PATIENT_ACCOUNTS")
        .where("username", username)
        .where("password", password);
    } catch (error) {}
  },

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
          const token = jwt.sign(
            {
              patient_id: usernameExisting.patient_id,
              username: usernameExisting.status,
            },
            process.env.JWT_SECRET,
            {
              // expiresIn 3 day
              expiresIn: "72h",
            }
          );
          return { success: true, token: token };
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
};

// Export đối tượng chứa các hàm
module.exports = accountPatientServices;
