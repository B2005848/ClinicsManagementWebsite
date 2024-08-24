require("dotenv").config();
const app = require("./src/app");
const { checkconnection } = require("./db.config");

// Start server
const PORT = process.env.PORT;

//test connect
checkconnection().then((connected) => {
  if (connected) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(
        `Server is running on all network interfaces at port ${PORT}.`
      );
    });
  } else {
    console.error("Connection to database failed");
  }
});
