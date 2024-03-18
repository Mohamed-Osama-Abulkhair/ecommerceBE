import express from "express";
import * as categoryController from "./category.controller.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
import { validation } from "../../middleware/validation.js";
import {
  createCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import { fileUpload } from "../../middleware/fileUpload.js";
import brandRouter from "../brand/brand.router.js";
import { allowedTo, isConfirmed, protectRoutes } from "../auth/auth.js";

const categoryRouter = express.Router();

categoryRouter.use("/:categoryId/subcategories", subcategoryRouter);
categoryRouter.use("/:categoryId/brands", brandRouter);

categoryRouter
  .route("/")
  .post(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().fields([
      { name: "navImages", maxCount: 2 },
      { name: "mainSliderImages", maxCount: 5 },
    ]),
    validation(createCategorySchema),
    categoryController.addCategory
  )
  .get(categoryController.getAllCategories);

categoryRouter
  .route("/:id")
  .get(validation(getCategorySchema), categoryController.getCategory)
  .put(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    fileUpload().fields([
      { name: "navImages", maxCount: 2 },
      { name: "mainSliderImages", maxCount: 5 },
    ]),
    validation(updateCategorySchema),
    categoryController.updateCategory
  )
  .delete(
    protectRoutes,
    allowedTo("admin"),
    isConfirmed,
    validation(getCategorySchema),
    categoryController.deleteCategory
  );

export default categoryRouter;
