const express = require("express");
const productController = require("../controllers/productController");
const auth = require(`../middlewares/authMiddleware`);

const app = express();
app.use(express.json());


app.post(
  "/",
  auth.authVerify,
  productController.addProduct
);
app.delete(
  "/:id",
  auth.authVerify,
  productController.deleteProduct
);

//with pagination
app.get("/", auth.authVerify, productController.getProduct);

app.put(
  "/:id",
  auth.authVerify,
  productController.updateProduct
);
app.get("/find/:id", auth.authVerify, productController.findProduct);

//without pagination
app.get("/find-all", auth.authVerify, productController.findAll);

module.exports = app;
