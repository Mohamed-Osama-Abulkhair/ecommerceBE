import express from "express";
import * as orderController from "./order.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createOrderSchema } from "./order.validation.js";

const orderRouter = express.Router();

orderRouter
  .route("/")
  .get(protectRoutes,allowedTo("user"),orderController.getSpecificOrder)
  
  orderRouter
  .route("/all")
  .get(protectRoutes,allowedTo("admin"),orderController.getAllOrders)

orderRouter
  .route("/:id")
  .post(protectRoutes,allowedTo("user"),validation(createOrderSchema),orderController.createCashOrder)
  
orderRouter
  .route("/checkout/:id")
  .post(protectRoutes,allowedTo("user"),orderController.createCheckOutSession)

export default orderRouter;
