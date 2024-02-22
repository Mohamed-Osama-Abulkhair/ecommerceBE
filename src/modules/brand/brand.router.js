import express from "express";
import * as brandController from "./brand.controller.js";
import { allowedTo, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import {
  createBrandSchema,
  getBrandSchema,
  updateBrandSchema,
} from "./brand.validation.js";
import { uploadSingleFile } from "../../middleware/fileUpload.js";
const brandRouter = express.Router();

brandRouter
  .route("/")
  .post(
    uploadSingleFile("logo", "brand"),
    validation(createBrandSchema),
    protectRoutes,
    allowedTo("admin"),
    brandController.addBrand
  )
  .get(brandController.getAllBrands);

brandRouter
  .route("/:id")
  .get(validation(getBrandSchema), brandController.getBrand)
  .put(
    uploadSingleFile("logo", "brand"),
    validation(updateBrandSchema),
    protectRoutes,
    allowedTo("admin"),
    brandController.updateBrand
  )
  .delete(
    validation(getBrandSchema),
    protectRoutes,
    allowedTo("admin"),
    brandController.deleteBrand
  );

export default brandRouter;
