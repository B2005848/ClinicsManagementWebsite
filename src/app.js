const express = require("express");
const path = require("path");
const cors = require("cors");
// =============ROUTER FOR UPLOAD FILE==========>
const upLoadFileRoutes = require("./Routers/upload.route");
// =============ROUTER FOR PATIENTS==============>
const emailPatientRoutes = require("./Routers/email.router");
const routerAccountPatient = require("./Routers/account.patients.route");
const routerPatient = require("./Routers/handle.patient.router");

// ============ROUTER FOR STAFFS=================>
const routerAccountStaff = require("./Routers/account.staff.route");
const routerStaff = require("./Routers/handle.staff.route");

//============ROUTER FOR SERVICE BOOKING=========>
const routerBooking = require("./Routers/handle.appointment.route");

//===========ROUTER FOR API DEPARTMENTS========>
const routerDepartments = require("./Routers/handle.department.route");
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
app.use(
  "/uploads/avtStaffs",
  (req, res, next) => {
    console.log(`Request for: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, "uploads/avtStaffs"))
);
// ----------------------------API FOR PATIENTS----------------
app.use("/api/patient/account", routerAccountPatient);
app.use("/api/handle/patient", routerPatient);
app.use("/api/patient/email", emailPatientRoutes);

// --------------------API FOR STAFFS---------------------
app.use("/api/staff/account", routerAccountStaff);
app.use("/api/handle/staff", routerStaff);

//---------------------API FOR APPOINTMENTS----------------
app.use("/api/appointment", routerBooking);

//----------------------API FOR DEPARTMENTS--------------
app.use("/api/departments", routerDepartments);

//-----------------------API FOR UPLOAD FILE----------
app.use("/api/file", upLoadFileRoutes);

app.use(resourceNotFound);
app.use(methodNotAllowed);
app.use(handleError);

module.exports = app;
