import express from "express";
import * as couponController from "./coupon.controller.js";
import { allowedTo, isConfirmed, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import {
  createCouponSchema,
  getCouponSchema,
  updateCouponSchema,
} from "./coupon.validation.js";
const couponRouter = express.Router();

couponRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(createCouponSchema),
    couponController.addCoupon
  )
  .get(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    couponController.getAllCoupons
  );

couponRouter
  .route("/:id")
  .get(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(getCouponSchema),
    couponController.getCoupon
  )
  .put(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(updateCouponSchema),
    couponController.updateCoupon
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(getCouponSchema),
    couponController.deleteCoupon
  );

couponRouter.get(
  "/user/couponGift",
  protectRoutes,
  allowedTo("user"),
  // isConfirmed,
  couponController.getCouponUserGift
);

export default couponRouter;
