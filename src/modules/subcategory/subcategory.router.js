import express from "express";
import * as subcategoryController from "./subcategory.controller.js";
import { validation } from "../../middleware/validation.js";
import {
  createSubcategorySchema,
  getSubcategorySchema,
  updateSubcategorySchema,
} from "./subcategory.validation.js";
import { allowedTo, isConfirmed, protectRoutes } from "../auth/auth.js";
import { fileUpload } from "../../middleware/fileUpload.js";
const subcategoryRouter = express.Router({ mergeParams: true });

subcategoryRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().fields([{ name: "sliderImages", maxCount: 5 }]),
    validation(createSubcategorySchema),
    subcategoryController.addSubcategory
  )
  .get(subcategoryController.getAllSubcategories);

subcategoryRouter
  .route("/:id")
  .get(validation(getSubcategorySchema), subcategoryController.getSubcategory)
  .put(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().fields([{ name: "sliderImages", maxCount: 5 }]),
    validation(updateSubcategorySchema),
    subcategoryController.updateSubcategory
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(getSubcategorySchema),
    subcategoryController.deleteSubcategory
  );

export default subcategoryRouter;
