const express = require("express");
const path = require("path");
const cors = require("cors");
const routerAccount = require("./Routers/account.patients.route");
const routerPatient = require("./Routers/handle.patient.router");
const {
  resourceNotFound,
  methodNotAllowed,
  handleError,
} = require("./Controllers/errors.controller");
// create app use express
const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Back end Thực tập thực tế",
  });
});

app.use("/api/patient/account", routerAccount);
app.use("/api/handle/patient", routerPatient);

app.use(resourceNotFound);
app.use(methodNotAllowed);
app.use(handleError);

module.exports = app;
