const bcrypt = require("bcryptjs");
const { knex } = require("../../db.config");
const { Vonage } = require("@vonage/server-sdk");

const vonage = new Vonage({
  apiKey: process.env.VONAGE_API_KEY,
  apiSecret: process.env.VONAGE_API_SECRET,
});

async function sendOTP(phoneNumber, otp) {
  const from = "Vonage APIs"; // Thay đổi theo tên bạn đã cấu hình
  const text = `Your verification code is ${otp}`;

  try {
    const response = await vonage.sms.send({ to: phoneNumber, from, text });
    if (response.messages[0].status !== "0") {
      throw new Error(
        `Failed to send SMS: ${response.messages[0]["error-text"]}`
      );
    }
    return { success: true };
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function createAccount(accountData, patient_detailsData) {
  let transaction;
  try {
    transaction = await knex.transaction();
    accountData.status = "1";
    const saltRounds = 10;
    const salt = await bcrypt.genSalt(saltRounds);
    const passwd_hash = await bcrypt.hash(accountData.password, salt);
    accountData.password = passwd_hash;
    accountData.salt = salt;

    // check account exit?
    const accountExisting = await transaction("PATIENT_ACCOUNTS")
      .where("patient_id", accountData.patient_id)
      .first();

    if (!accountExisting) {
      // Add a new account
      await transaction("PATIENT_ACCOUNTS").insert(accountData);
      patient_detailsData.patient_id = accountData.patient_id;
      await transaction("PATIENT_DETAILS").insert(patient_detailsData);
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
    const usernameExisting = await knex("PATIENT_ACCOUNTS")
      .where("patient_id", username)
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
  sendOTP,
};
