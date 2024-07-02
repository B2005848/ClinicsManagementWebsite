const bcrypt = require("bcryptjs");
const { knex } = require("../../db.config");

async function createAccount(accountData, patient_detailsData) {
  let transaction;
  try {
    transaction = await knex.transaction();
    accountData.statusAccount = "1";
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwd_hash = await bcrypt.hash(accountData.password, salt);
    accountData.password = passwd_hash;
    accountData.salt = salt;

    // Kiểm tra tài khoản đã tồn tại trong giao dịch
    const accountExisting = await transaction("patient_account")
      .where("username", accountData.username)
      .first();

    if (!accountExisting) {
      // Chèn tài khoản mới
      await transaction("patient_account").insert(accountData);
      patient_detailsData.username = accountData.username;
      await transaction("patient_details").insert(patient_detailsData);
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
        data: [accountData],
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
}

async function checkLogin(username, password) {
  try {
    const usernameExisting = await knex("patient_account")
      .where("username", username)
      .first();
    if (usernameExisting) {
      const salt = usernameExisting.salt;
      const passwd_hash = await bcrypt.hash(password, salt);
      if (passwd_hash == usernameExisting.password) {
        console.log(`Login success with username: ${username}`);
        return true;
      } else {
        console.log(`Incorrect password for username: ${username}`);
        return false;
      }
    }
  } catch (error) {
    throw error;
  }
}

module.exports = {
  createAccount,
  checkLogin,
};
