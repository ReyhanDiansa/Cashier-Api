const express = require("express");
const cors = require("cors");
require("dotenv/config");
const authRoute = require("./routes/authRoute");
const sizeRoute = require("./routes/sizeRoute");
const colorRoute = require("./routes/colorRoute");
const productRoute = require("./routes/productRoute");
const userRoute = require("./routes/userRoute");
const orderRoute = require("./routes/orderRoute");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const apiRouter = express.Router();
apiRouter.use(`/auth`, authRoute);
apiRouter.use(`/size`, sizeRoute);
apiRouter.use(`/color`, colorRoute);
apiRouter.use(`/product`, productRoute);
apiRouter.use(`/order`, orderRoute);
apiRouter.use(`/user`, userRoute);

//grouped router
app.use(`/api/v1`, apiRouter);


app.listen(process.env.PORT, () => {
  console.log(`Node API is Running on port ${process.env.PORT}`);
});