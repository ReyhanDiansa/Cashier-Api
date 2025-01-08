const express = require("express");
const userController = require("../controllers/userController");
const auth = require(`../middlewares/authMiddleware`);
const { roleCheck } = require("../middlewares/roleCheck");

const app = express();
app.use(express.json());

app.post(
  "/",
  auth.authVerify,
  roleCheck(["admin"]),
  userController.addUser
);

//with pagination
app.get(
  "/",
  auth.authVerify,
  roleCheck(["admin"]),
  userController.getUser
);

//without pagination
app.get(
  "/find/:id",
  auth.authVerify,
  roleCheck(["admin"]),
  userController.findUser
);
app.put(
  "/:id",
  auth.authVerify,
  roleCheck(["admin"]),
  userController.updateUser
);
app.delete(
  "/:id",
  auth.authVerify,
  roleCheck(["admin"]),
  userController.deleteUser
);

app.get(
  "/find-all",
  auth.authVerify,
  roleCheck(["admin"]),
  userController.findAll
);

module.exports = app;
