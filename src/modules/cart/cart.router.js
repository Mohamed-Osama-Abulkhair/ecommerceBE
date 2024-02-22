import express from "express";
import * as cartController from "./cart.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { applyCouponCartSchema, createCartSchema, getCartSchema, updateCartSchema } from "./cart.validation.js";

const cartRouter = express.Router();

cartRouter
  .route("/")
  .post(validation(createCartSchema),protectRoutes,allowedTo("user"),cartController.addProductToCart)
  .put(validation(applyCouponCartSchema),protectRoutes,allowedTo("user"),cartController.applyCoupon)
  .get(protectRoutes,allowedTo("user"),cartController.getLoggedUserCart)
  .delete(protectRoutes,allowedTo("user"),cartController.clearCart)

cartRouter
  .route("/:id")
  .delete(validation(getCartSchema),protectRoutes,allowedTo("user"),cartController.deleteProductFromCart)
  .put(validation(updateCartSchema),protectRoutes,allowedTo("user"),cartController.updateQuantity);

export default cartRouter;
