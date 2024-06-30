const express = require("express");
const cors = require("cors");
const userRouter = require("./Routers/user.route");

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
    message: "Welcome to my project ",
  });
});

app.use("/api/users", userRouter);

app.use(resourceNotFound);
app.use(methodNotAllowed);
app.use(handleError);

module.exports = app;
