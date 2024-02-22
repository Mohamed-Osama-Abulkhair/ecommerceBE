import express from "express";
import * as productController from "./product.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import { createProductSchema, getProductSchema, updateProductSchema } from "./product.validation.js";
import { uploadMixOfFiles } from "../../middleware/fileUpload.js";

const productRouter = express.Router();
let fieldsArr=[{ name: 'imageCover', maxCount: 1 }, { name: 'images', maxCount: 10 }]

productRouter
  .route("/")
  .post(uploadMixOfFiles(fieldsArr,"/product/"),validation(createProductSchema),protectRoutes,allowedTo("admin"),productController.addProduct)
  .get(productController.getAllProducts);

productRouter
  .route("/:id")
  .get(validation(getProductSchema),productController.getProduct)
  .put(validation(updateProductSchema),protectRoutes,allowedTo("admin"),productController.updateProduct)
  .delete(validation(getProductSchema),protectRoutes,allowedTo("admin"),productController.deleteProduct);

export default productRouter;
