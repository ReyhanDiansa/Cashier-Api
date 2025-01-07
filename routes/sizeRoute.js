const express = require("express");
const sizeController = require("../controllers/sizeController");
const auth = require(`../middlewares/authMiddleware`);

const app = express();
app.use(express.json());


app.post(
  "/",
  auth.authVerify,
  sizeController.addSize
);
app.delete(
  "/:id",
  auth.authVerify,
  sizeController.deleteSize
);

//with pagination
app.get("/", auth.authVerify, sizeController.getSize);

app.put(
  "/:id",
  auth.authVerify,
  sizeController.updateSize
);
app.get("/find/:id", auth.authVerify, sizeController.findSize);

//without pagination
app.get("/find-all", auth.authVerify, sizeController.findAll);

module.exports = app;
