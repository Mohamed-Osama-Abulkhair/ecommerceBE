import express from "express";
import * as couponController from "./coupon.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createCouponSchema, getCouponSchema, updateCouponSchema } from "./coupon.validation.js";
const couponRouter = express.Router();

couponRouter
  .route("/")
  .post(validation(createCouponSchema),protectRoutes,allowedTo("admin"),couponController.addCoupon)
  .get(couponController.getAllCoupons);

couponRouter
  .route("/:id")
  .get(validation(getCouponSchema),couponController.getCoupon)
  .put(validation(updateCouponSchema),protectRoutes,allowedTo("admin"),couponController.updateCoupon)
  .delete(validation(getCouponSchema),protectRoutes,allowedTo("admin"),couponController.deleteCoupon);

export default couponRouter;
