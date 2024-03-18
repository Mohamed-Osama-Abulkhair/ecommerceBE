import express from "express";
import * as brandController from "./brand.controller.js";
import { allowedTo, isConfirmed, protectRoutes } from "../auth/auth.js";
import { validation } from "../../middleware/validation.js";
import {
  createBrandSchema,
  getBrandSchema,
  updateBrandSchema,
} from "./brand.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
const brandRouter = express.Router({ mergeParams: true });

brandRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().single("logo"),
    validation(createBrandSchema),
    brandController.addBrand
  )
  .get(brandController.getAllBrands);

brandRouter
  .route("/:id")
  .get(validation(getBrandSchema), brandController.getBrand)
  .put(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().single("logo"),
    validation(updateBrandSchema),
    brandController.updateBrand
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(getBrandSchema),
    brandController.deleteBrand
  );

export default brandRouter;
