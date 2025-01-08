const express = require("express");
const orderController = require("../controllers/orderController");
const auth = require(`../middlewares/authMiddleware`);
const { roleCheck } = require("../middlewares/roleCheck");

const app = express();
app.use(express.json());

app.post("/", auth.authVerify, orderController.addOrder);
app.get("/user-order", auth.authVerify, orderController.getUserOrder);
app.get("/find/:id", auth.authVerify, orderController.findOrder);
app.post("/pay/:id", auth.authVerify, orderController.payOrder);
app.delete("/:id", auth.authVerify, orderController.deleteOrder);
app.put(
  "/:id",
  auth.authVerify,
  orderController.updateOrder
);
app.get("/", auth.authVerify, orderController.getOrder);
app.post("/cancel/:id", auth.authVerify, orderController.cancelOrder);

module.exports = app;
