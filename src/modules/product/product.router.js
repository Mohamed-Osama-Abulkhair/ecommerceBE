import express from "express";
import * as productController from "./product.controller.js";
import { allowedTo, isConfirmed, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import {
  createProductSchema,
  getProductSchema,
  updateProductSchema,
} from "./product.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";

const productRouter = express.Router();

productRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    validation(createProductSchema),
    productController.addProduct
  )
  .get(productController.getAllProducts);

productRouter
  .route("/:id")
  .get(validation(getProductSchema), productController.getProduct)
  .put(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().fields([
      { name: "imageCover", maxCount: 1 },
      { name: "images", maxCount: 5 },
    ]),
    validation(updateProductSchema),
    productController.updateProduct
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(getProductSchema),
    productController.deleteProduct
  );

export default productRouter;
