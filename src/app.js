const express = require("express");
const path = require("path");
const cors = require("cors");
// =============ROUTER FOR UPLOAD FILE==========>
const upLoadFileRoutes = require("./Routers/upload.route");
// =============ROUTER FOR PATIENTS==============>
const emailPatientRoutes = require("./Routers/email.route");
const routerAccountPatient = require("./Routers/account.patients.route");
const routerPatient = require("./Routers/handle.patient.route");

// ============ROUTER FOR STAFFS=================>
const routerAccountStaff = require("./Routers/account.staff.route");
const routerStaff = require("./Routers/handle.staff.route");

//============== ROUTER FOR SHIFT===============
const routerShift = require("./Routers/handle.shift.route");

//============== ROUTER FOR ROLES===============
const routerRoles = require("./Routers/handle.roles.route");

//============ROUTER FOR SERVICE BOOKING=========>
const routerBooking = require("./Routers/handle.appointment.route");

//===========ROUTER FOR API DEPARTMENTS========>
const routerDepartments = require("./Routers/handle.department.route");

//===========ROUTER FOR API SPECIALTIES========>
const routerSpecialties = require("./Routers/handle.specialties.route");

//==========ROUTER FOR API SERVICE MANAGEMENTS======>
const routerServices = require("./Routers/handle.service.route");

//==========ROUTER FOR API PAYMENT METHOD============>
const routerPaymentMethod = require("./Routers/handle.paymentmethod.route");

//=========ROUTER FOR API THỐNG KÊ DOANH THU==========>
const routerRevenue = require("./Routers/transactions.route");

//==========ROUTER FOR API PAYMENT VNPAY==========>
const routerVNPayMethod = require("./Routers/handle.transaction.vnpay.route");

const messageRoutes = require("./Routers/mesage.route");
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

// ----------------------- API GET FILE AVATAR STAFF----------
app.use(
  "/uploads/avtStaffs",
  (req, res, next) => {
    console.log(`Request for: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, "uploads/avtStaffs"))
);

// ----------------------- API GET FILE AVATAR PATIENT----------
app.use(
  "/uploads/avtPatients",
  (req, res, next) => {
    console.log(`Request for: ${req.url}`);
    next();
  },
  express.static(path.join(__dirname, "uploads/avtPatients"))
);
// ----------------------------API FOR PATIENTS----------------
app.use("/api/patient/account", routerAccountPatient);
app.use("/api/handle/patient", routerPatient);
app.use("/api/patient/email", emailPatientRoutes);

// --------------------API FOR STAFFS---------------------
app.use("/api/staff/account", routerAccountStaff);
app.use("/api/handle/staff", routerStaff);

//---------------------API FOR SHIFTS--------------------
app.use("/api/shifts", routerShift);

//--------------------API FOR ROLES---------------------
app.use("/api/roles", routerRoles);

//---------------------API FOR APPOINTMENTS----------------
app.use("/api/appointment", routerBooking);

//----------------------API FOR DEPARTMENTS--------------
app.use("/api/departments", routerDepartments);

//----------------------API FOR SPECIALTIES--------------
app.use("/api/specialties", routerSpecialties);

//----------------------API FOR SERVICES--------------
app.use("/api/services", routerServices);

//--------------------API FOR PAYTMENT METHOD-----------
app.use("/api/payment-method", routerPaymentMethod);

//----------------A[I FOR PAYMENT VNPAY-------------
app.use("/api/VNPay/payment", routerVNPayMethod);

//-----------------------API FOR REVENUE----------
app.use("/api/statistics/revenue", routerRevenue);

//-----------------------API FOR UPLOAD FILE----------
app.use("/api/file", upLoadFileRoutes);

app.use("/api/messages", messageRoutes); // Các route liên quan đến tin nhắn
app.use(resourceNotFound);
app.use(methodNotAllowed);
app.use(handleError);

module.exports = app;
