import express from "express";
import * as subcategoryController from "./subcategory.controller.js";
import { validation } from "../../middleware/validation.js";
import { createSubcategorySchema, getSubcategorySchema, updateSubcategorySchema } from "./subcategory.validation.js";
const subcategoryRouter = express.Router({mergeParams:true});

subcategoryRouter
  .route("/")
  .post(validation(createSubcategorySchema),subcategoryController.addSubcategory)
  .get(subcategoryController.getAllSubcategories);

subcategoryRouter
  .route("/:id")
  .get(validation(getSubcategorySchema),subcategoryController.getSubcategory)
  .put(validation(updateSubcategorySchema),subcategoryController.updateSubcategory)
  .delete(validation(getSubcategorySchema),subcategoryController.deleteSubcategory);

export default subcategoryRouter;
