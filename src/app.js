const express = require("express");
const path = require("path");
const cors = require("cors");
const emailRoutes = require("./Routers/email.router");

const routerAccount = require("./Routers/account.patients.route");

const routerPatient = require("./Routers/handle.patient.router");

const routerStaff = require("./Routers/handle.staff.route");

const routerBooking = require("./Routers/handle.appointment.route");
const {
  resourceNotFound,
  methodNotAllowed,
  handleError,
} = require("./Controllers/errors.controller");
// create app use express
const app = express();

// app.use(
//   cors({
//     origin: ["http://localhost:8080", "http://10.1.44.233"],
//     methods: ["GET", "POST", "PUT", "DELETE"],
//     credentials: true, // Hỗ trợ cookie nếu cần
//   })
// );
app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "Server CTU final project",
  });
});
// ----------------------------API FOR PATIENTS----------------
app.use("/api/patient/account", routerAccount);
app.use("/api/handle/patient", routerPatient);
app.use("/api/patient/email", emailRoutes);

// --------------------API FOR STAFFS---------------------
app.use("/api/staff", routerStaff);

//---------------------API FOR APPOINTMENT----------------
app.use("/api/appointment", routerBooking);

app.use(resourceNotFound);
app.use(methodNotAllowed);
app.use(handleError);

module.exports = app;
