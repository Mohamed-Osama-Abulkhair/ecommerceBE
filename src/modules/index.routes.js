process.on("uncaughtException", (err) => console.log("error in coding", err));

import { globalErrorMiddleware } from "../middleware/globalErrorMiddleware.js";
import { appError } from "../utils/appError.js";
import addressRouter from "./address/address.router.js";
import brandRouter from "./brand/brand.router.js";
import cartRouter from "./cart/cart.router.js";
import categoryRouter from "./category/category.router.js";
import couponRouter from "./coupon/coupon.router.js";
import orderRouter from "./order/order.router.js";
import productRouter from "./product/product.router.js";
import reviewRouter from "./review/review.router.js";
import subcategoryRouter from "./subcategory/subcategory.router.js";
import userRouter from "./user/user.router.js";
import wishlistRouter from "./wishlist/wishlist.router.js";

export const init = (app) => {
  app.get("/", (req, res, next) => {
    res.status(200).json({ message: "Welcome to Abulkhair E-commerce App" });
  });
  app.use("/api/v1/categories", categoryRouter);
  app.use("/api/v1/subcategories", subcategoryRouter);
  app.use("/api/v1/brands", brandRouter);
  app.use("/api/v1/products", productRouter);
  app.use("/api/v1/users", userRouter);
  app.use("/api/v1/reviews", reviewRouter);
  app.use("/api/v1/wishlist", wishlistRouter);
  app.use("/api/v1/address",addressRouter);
  app.use("/api/v1/coupons", couponRouter);
  app.use("/api/v1/carts", cartRouter);
  app.use("/api/v1/orders", orderRouter);

  app.all("*", (req, res, next) => {
    next(new appError("invalid url" + req.originalUrl, 404));
  });

  // global error handling middleware
  app.use(globalErrorMiddleware);
};

process.on("unhandledRejection", (err) =>
  console.log("error outside express", err)
);
