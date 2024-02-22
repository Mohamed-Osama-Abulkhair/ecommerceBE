import express from "express";
import * as categoryController from "./category.controller.js";
import subcategoryRouter from "../subcategory/subcategory.router.js";
import { validation } from "../../middleware/validation.js";
import {
  createCategorySchema,
  getCategorySchema,
  updateCategorySchema,
} from "./category.validation.js";
import { uploadSingleFile } from "../../middleware/fileUpload.js";

const categoryRouter = express.Router();

categoryRouter.use("/:categoryId/subcategories", subcategoryRouter);

categoryRouter
  .route("/")
  .post(uploadSingleFile("image","category"),validation(createCategorySchema), categoryController.addCategory)
  .get(categoryController.getAllCategories);

categoryRouter
  .route("/:id")
  .get(validation(getCategorySchema), categoryController.getCategory)
  .put(uploadSingleFile("image","category"),validation(updateCategorySchema), categoryController.updateCategory)
  .delete(validation(getCategorySchema), categoryController.deleteCategory);

export default categoryRouter;
