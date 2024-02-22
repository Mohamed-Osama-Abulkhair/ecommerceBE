import express from "express";
import * as dotenv from "dotenv";
dotenv.config();
import { dbConnection } from "./databases/dbConnection.js";
import { init } from "./src/modules/index.routes.js";
import cors from "cors";
import { createOnlineOrder } from "./src/modules/order/order.controller.js";
const app = express();

// middlewares
app.use(cors());
app.post(
  "/webhook",
  express.raw({ type: "application/json" }),
  createOnlineOrder
);

app.use(express.json());
app.use(express.static("uploads"));

init(app);
dbConnection();

const port = 3000;
app.listen(process.env.PORT || port, () =>
  console.log(`server is listening on port ${port}`)
);
