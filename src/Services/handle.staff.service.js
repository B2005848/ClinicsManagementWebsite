const bcrypt = require("bcryptjs");

const { knex } = require("../../db.config");
const jwt = require("jsonwebtoken");
require("dotenv").config();
const handleStaffService = {
  // --------------------------------CREATE ACCOUNT STAFF-------------------------------
  async createAccount(accountData, staff_detailsData) {
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

  // ----------------------------GET ACCOUNT ALL STAFF------------------------------
  async getStaffAccountList(page) {
    try {
      const itemsPerPage = 10;
      // skip offset first in table
      const offset = (page - 1) * itemsPerPage;

      // Get quantity staff
      const totalStaffs = await knex("STAFF_ACCOUNTS")
        .count("* as totalCount")
        .first();
      // Get value quantity staff
      const totalStaffsCount = totalStaffs.totalCount;
      // Calculate quantity page
      const totalPages = Math.ceil(totalStaffsCount / itemsPerPage);
      if (page > totalPages) {
        return {
          status: false,
          message: `Page ${page} exceeds total number of pages (${totalPages}). No staff available.`,
          totalPages,
          staffList: [],
        };
      }
      // Get staff list by position page
      const staffList = await knex("STAFF_ACCOUNTS as sa")
        .select(
          "sa.*",
          "sd.first_name",
          "sd.last_name",
          "sd.email",
          "sd.citizen_id"
        )
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .orderBy("sa.staff_id", "asc")
        .limit(itemsPerPage)
        .offset(offset);
      if (
        // Check if staff list is empty
        staffList.length === 0
      ) {
        console.log(
          "Staff list is empty. Please check your database or contact admin."
        );
        return {
          status: false,
          message: "Staff list is empty",
          totalPages,
          staffList,
        };
      } else {
        console.log(
          `Get staff list success . Total staffs: ${totalStaffsCount}`
        );
        return {
          status: true,
          message: "Account staff list",
          totalPages,
          staffList,
        };
      }
    } catch (error) {
      console.error("Error during get account list staff account :", error);
      throw error;
    }
  },

  //------------------------------GET INFORMATION DETAILS STAFF BY STAFF_ID------------------------------
  async getStaffInfoById(staffId) {
    try {
      // Get staff info by staff id
      const staffInfo = await knex("STAFF_ACCOUNTS as sa")
        .select("sd.*", "sa.role_id as role", "sa.status as statusAccount")
        .join("STAFF_DETAILS as sd", "sd.staff_id", "sa.staff_id")
        .where("sa.staff_id", staffId)
        .first();
      if (!staffInfo) {
        console.log("Staff not found");
        return {
          status: false,
          message: "Staff not found",
        };
      } else {
        console.log("Get staff info by staff id success");
        return {
          status: true,
          message: "Staff info",
          data: [staffInfo],
        };
      }
    } catch (error) {
      console.error("Error during get account list staff account :", error);
      throw error;
    }
  },

  //------------------- SEARCH STAFF BY NAME, EMAIL, STAFF_ID--------------------
};

module.exports = handleStaffService;
