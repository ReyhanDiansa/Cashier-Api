const express = require("express");
const userController = require("../controllers/userController");

const app = express();
app.use(express.json());

app.get(
  "/",
  userController.getUser
);
app.get(
  "/find/:id",
  userController.findUser
);
app.put(
  "/:id",
  userController.updateUser
);
app.delete(
  "/:id",
  userController.deleteUser
);

app.post("/login", userController.Login);
app.post(
  "/register",
  userController.Register
);

module.exports = app;