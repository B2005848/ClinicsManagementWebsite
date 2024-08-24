require("dotenv").config();
const { DB_HOST, DB_HOST_APP, DB_PORT, DB_USER, DB_PASS, DB_NAME } =
  process.env;

const knex = require("knex")({
  client: "mssql",
  connection: {
    host: DB_HOST,
    port: parseInt(DB_PORT, 10),
    user: DB_USER,
    password: DB_PASS,
    database: DB_NAME,
    options: {
      encrypt: true,
      trustServerCertificate: true,
    },
  },
});

// check connect
async function checkconnection() {
  try {
    await knex.raw("SELECT 1");
    console.log(
      `Connection to database successfully! with database name: ${DB_NAME}`
    );
    return true;
  } catch (error) {
    console.error("Error while connectting database ", error);
    return false;
  }
}

module.exports = {
  knex,
  checkconnection,
};
