const express = require("express");
const colorController = require("../controllers/colorController");
const auth = require(`../middlewares/authMiddleware`);
const { roleCheck } = require("../middlewares/roleCheck");

const app = express();
app.use(express.json());


app.post(
  "/",
  auth.authVerify,
  roleCheck(['admin']),
  colorController.addColor
);
app.delete(
  "/:id",
  auth.authVerify,
  roleCheck(['admin']),
  colorController.deleteColor
);

//with pagination
app.get("/", auth.authVerify, colorController.getColor);

app.put(
  "/:id",
  auth.authVerify,
  roleCheck(['admin']),
  colorController.updateColor
);
app.get("/find/:id", auth.authVerify, colorController.findColor);

//without pagination
app.get("/find-all", auth.authVerify, colorController.findAll);

module.exports = app;
